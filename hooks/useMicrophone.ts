"use client";

import { useState, useRef, useCallback } from "react";

interface AudioChunk {
	data: Float32Array;
	timestamp: number;
}

export function useMicrophone() {
	const [isRecording, setIsRecording] = useState(false);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const processorRef = useRef<ScriptProcessorNode | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const audioChunks = useRef<Blob[]>([]);
	const onChunkCallback = useRef<((chunk: AudioChunk) => void) | null>(null);

	const startRecording = useCallback(
		async (onChunk?: (chunk: AudioChunk) => void) => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: {
						echoCancellation: true,
						noiseSuppression: true,
						autoGainControl: true,
						sampleRate: 16000,
					},
				});

				streamRef.current = stream;
				audioChunks.current = [];
				onChunkCallback.current = onChunk || null;

				// Set up MediaRecorder for final audio
				mediaRecorderRef.current = new MediaRecorder(stream, {
					mimeType: "audio/webm;codecs=opus",
				});

				mediaRecorderRef.current.ondataavailable = (event) => {
					if (event.data.size > 0) {
						audioChunks.current.push(event.data);
					}
				};

				mediaRecorderRef.current.onstop = () => {
					const audioBlob = new Blob(audioChunks.current, {
						type: "audio/webm",
					});
					const url = URL.createObjectURL(audioBlob);
					setAudioUrl(url);
				};

				// Set up real-time audio processing
				audioContextRef.current = new AudioContext({ sampleRate: 16000 });
				const source = audioContextRef.current.createMediaStreamSource(stream);

				processorRef.current = audioContextRef.current.createScriptProcessor(
					4096,
					1,
					1
				);

				processorRef.current.onaudioprocess = (event) => {
					if (onChunkCallback.current) {
						const inputData = event.inputBuffer.getChannelData(0);
						const chunk: AudioChunk = {
							data: new Float32Array(inputData),
							timestamp: performance.now(),
						};
						onChunkCallback.current(chunk);
					}
				};

				source.connect(processorRef.current);
				processorRef.current.connect(audioContextRef.current.destination);

				mediaRecorderRef.current.start();
				setIsRecording(true);
				setIsProcessing(false);
			} catch (err) {
				console.error("Unable to access microphone", err);
			}
		},
		[]
	);

	const stopRecording = useCallback(() => {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop();
		}

		if (processorRef.current) {
			processorRef.current.disconnect();
			processorRef.current = null;
		}

		if (audioContextRef.current) {
			audioContextRef.current.close();
			audioContextRef.current = null;
		}

		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}

		setIsRecording(false);
		setIsProcessing(true);
	}, []);

	const clearAudio = useCallback(() => {
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
			setAudioUrl(null);
		}
		setIsProcessing(false);
	}, [audioUrl]);

	return {
		audioUrl,
		isRecording,
		isProcessing,
		startRecording,
		stopRecording,
		clearAudio,
	};
}
