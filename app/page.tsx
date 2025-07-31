"use client";

import { useMicrophone } from "@/hooks/useMicrophone";

export default function Home() {
	const { isRecording, audioUrl, startRecording, stopRecording } =
		useMicrophone();

	return (
		<>
			<main className="flex flex-col items-center gap-4 mt-10">
				<h1>Lerc Voice Assistant</h1>
				{!isRecording ? (
					<button
						onClick={startRecording}
						className="px-4 py-2 bg-green-500 text-white rounded-lg">
						Start Recording
					</button>
				) : (
					<button
						onClick={stopRecording}
						className="px-4 py-2 bg-red-500 text-white rounded-lg">
						Stop Recording
					</button>
				)}

				{audioUrl && (
					<audio controls src={audioUrl} className="mt-4">
						Your browser does not support audio playback.
					</audio>
				)}
			</main>
		</>
	);
}
