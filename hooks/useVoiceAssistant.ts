"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMicrophone } from "./useMicrophone";

interface LatencyMetrics {
	stt: number;
	api: number;
	tts: number;
	total: number;
}

interface ConversationMessage {
	role: "user" | "assistant";
	content: string;
	timestamp: number;
}

export function useVoiceAssistant() {
	const [isListening, setIsListening] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [response, setResponse] = useState("");
	const [conversation, setConversation] = useState<ConversationMessage[]>([]);
	const [latencies, setLatencies] = useState<LatencyMetrics>({
		stt: 0,
		api: 0,
		tts: 0,
		total: 0,
	});
	const [error, setError] = useState<string | null>(null);

	const whisperWorkerRef = useRef<Worker | null>(null);
	const ttsWorkerRef = useRef<Worker | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const pipelineStartTime = useRef<number>(0);

	const { startRecording, stopRecording, clearAudio } = useMicrophone();

	// Initialize workers
	useEffect(() => {
		// Initialize Whisper worker
		whisperWorkerRef.current = new Worker(
			new URL("../workers/whisperWorker.ts", import.meta.url)
		);

		whisperWorkerRef.current.onmessage = (event) => {
			const { type, text, error: workerError, duration } = event.data;

			if (type === "ready") {
				console.log("[WHISPER] Worker ready");
			} else if (type === "result") {
				const sttTime = duration || 0;
				setTranscript(text);
				setLatencies((prev) => ({ ...prev, stt: sttTime }));

				// Continue to LLM
				handleLLMRequest(text);
			} else if (type === "error") {
				setError(`STT Error: ${workerError}`);
				setIsProcessing(false);
			}
		};

		// Initialize TTS worker
		ttsWorkerRef.current = new Worker(
			new URL("../workers/ttsWorker.ts", import.meta.url)
		);

		ttsWorkerRef.current.onmessage = (event) => {
			const { type, audioBuffer, error: workerError, duration } = event.data;

			if (type === "ready") {
				console.log("[TTS] Worker ready");
			} else if (type === "result") {
				const ttsTime = duration || 0;
				setLatencies((prev) => ({ ...prev, tts: ttsTime }));

				// Play audio
				playAudio(audioBuffer);
			} else if (type === "error") {
				setError(`TTS Error: ${workerError}`);
				setIsProcessing(false);
			}
		};

		// Initialize workers
		whisperWorkerRef.current.postMessage({ type: "init" });
		ttsWorkerRef.current.postMessage({ type: "init" });

		return () => {
			whisperWorkerRef.current?.terminate();
			ttsWorkerRef.current?.terminate();
		};
	}, []);

	const handleLLMRequest = useCallback(async (text: string) => {
		try {
			const apiStartTime = performance.now();

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: text }),
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.statusText}`);
			}

			const data = await response.json();
			const apiTime = performance.now() - apiStartTime;

			setResponse(data.response);
			setLatencies((prev) => ({ ...prev, api: apiTime }));

			// Add to conversation
			setConversation((prev) => [
				...prev,
				{ role: "user", content: text, timestamp: Date.now() },
				{ role: "assistant", content: data.response, timestamp: Date.now() },
			]);

			// Continue to TTS
			handleTTSRequest(data.response);
		} catch (err) {
			setError(
				`LLM Error: ${err instanceof Error ? err.message : "Unknown error"}`
			);
			setIsProcessing(false);
		}
	}, []);

	const handleTTSRequest = useCallback((text: string) => {
		if (!ttsWorkerRef.current) {
			setError("TTS worker not initialized");
			setIsProcessing(false);
			return;
		}

		ttsWorkerRef.current.postMessage({
			type: "synthesize",
			text,
		});
	}, []);

	const playAudio = useCallback((audioBuffer: ArrayBuffer) => {
		if (!audioContextRef.current) {
			audioContextRef.current = new AudioContext();
		}

		audioContextRef.current
			.decodeAudioData(audioBuffer)
			.then((buffer) => {
				const source = audioContextRef.current!.createBufferSource();
				source.buffer = buffer;
				source.connect(audioContextRef.current!.destination);

				setIsSpeaking(true);

				source.onended = () => {
					setIsSpeaking(false);
					setIsProcessing(false);

					// Calculate total latency
					const totalTime = performance.now() - pipelineStartTime.current;
					setLatencies((prev) => {
						console.log("Pipeline completed:", {
							stt: prev.stt,
							api: prev.api,
							tts: prev.tts,
							total: totalTime,
						});
						return { ...prev, total: totalTime };
					});
				};

				source.start();
			})
			.catch((err) => {
				setError(`Audio playback error: ${err.message}`);
				setIsProcessing(false);
			});
	}, []);

	const startListening = useCallback(() => {
		setError(null);
		setTranscript("");
		setResponse("");
		setIsProcessing(true);
		pipelineStartTime.current = performance.now();

		startRecording((chunk) => {
			// Stream audio chunks to Whisper worker for real-time processing
			if (whisperWorkerRef.current && isListening) {
				// Convert Float32Array to ArrayBuffer for worker
				const arrayBuffer = chunk.data.buffer.slice(
					chunk.data.byteOffset,
					chunk.data.byteOffset + chunk.data.byteLength
				);
				whisperWorkerRef.current.postMessage({
					type: "transcribe",
					audioBuffer: arrayBuffer,
				});
			}
		});

		setIsListening(true);
	}, [startRecording, isListening]);

	const stopListening = useCallback(() => {
		stopRecording();
		setIsListening(false);

		// Process final audio for transcription
		if (whisperWorkerRef.current) {
			// This would be the final audio processing
			// For now, we'll use the recorded audio
		}
	}, [stopRecording]);

	const reset = useCallback(() => {
		setIsListening(false);
		setIsProcessing(false);
		setIsSpeaking(false);
		setTranscript("");
		setResponse("");
		setError(null);
		setLatencies({ stt: 0, api: 0, tts: 0, total: 0 });
		clearAudio();
	}, [clearAudio]);

	return {
		isListening,
		isProcessing,
		isSpeaking,
		transcript,
		response,
		conversation,
		latencies,
		error,
		startListening,
		stopListening,
		reset,
	};
}
