"use client";

import { Button } from "@/components/ui/button";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useEffect, useRef, useState } from "react";

export default function Home() {
	const { isRecording, audioUrl, startRecording, stopRecording } =
		useMicrophone();

	const workerRef = useRef<Worker | null>(null);
	const [transcript, setTranscript] = useState("");

	useEffect(() => {
		workerRef.current = new Worker(
			new URL("../workers/whisperWorker.ts", import.meta.url)
		);
		workerRef.current.onmessage = (event) => {
			if (event.data.message === "ready") {
				console.log("Worker Ready");
			} else if (event.data.message === "result") {
				setTranscript(event.data.text);
			}
		};

		workerRef.current.postMessage({ type: "init" });

		return () => {
			workerRef.current?.terminate();
		};
	}, []);

	const handleTranscribe = async () => {
		if (!audioUrl || !workerRef.current) return;

		const response = await fetch(audioUrl);
		const audioBlob = await response.blob();

		const audioBuffer = await audioBlob.arrayBuffer();

		workerRef.current.postMessage({ type: "transcribe", audioBuffer });
	};

	return (
		<>
			<main className="flex flex-col items-center gap-4 mt-10">
				<h1>Lerc Voice Assistant</h1>
				{!isRecording ? (
					<Button
						onClick={startRecording}
						className="px-4 py-2 bg-green-500 text-white rounded-lg">
						Start Recording
					</Button>
				) : (
					<Button
						onClick={stopRecording}
						className="px-4 py-2 bg-red-500 text-white rounded-lg">
						Stop Recording
					</Button>
				)}

				{audioUrl && (
					<>
						<audio controls src={audioUrl} className="mt-4">
							Your browser does not support audio playback.
						</audio>
						<Button
							onClick={handleTranscribe}
							className="px-4 py-2 bg-blue-500 text-white rounded-lg">
							Transcribe
						</Button>
					</>
				)}

				{transcript && (
					<p className="mt-4 p-2 bg-gray-200 rounded">{transcript}</p>
				)}
			</main>
		</>
	);
}
