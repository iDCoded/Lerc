"use client";

import { Button } from "@/components/ui/button";
import { useMicrophone } from "@/hooks/useMicrophone";

export default function Home() {
	const { isRecording, audioUrl, startRecording, stopRecording } =
		useMicrophone();

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
					<audio controls src={audioUrl} className="mt-4">
						Your browser does not support audio playback.
					</audio>
				)}
			</main>
		</>
	);
}
