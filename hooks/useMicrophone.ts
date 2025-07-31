"use client";

import { useState, useRef } from "react";

export function useMicrophone() {
	const [isRecording, setIsRecording] = useState(false);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunks = useRef<Blob[]>([]);

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorderRef.current = new MediaRecorder(stream);

			audioChunks.current = [];
			mediaRecorderRef.current.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.current.push(event.data);
				}
			};

			mediaRecorderRef.current.onstop = () => {
				const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
				const url = URL.createObjectURL(audioBlob);
				setAudioUrl(url);
			};

			mediaRecorderRef.current.start();
			setIsRecording(true);
		} catch (err) {
			console.error("Unable to access microphone", err);
		}
	};

	const stopRecording = () => {
		mediaRecorderRef.current?.stop();
		setIsRecording(false);
	};

	return { audioUrl, isRecording, startRecording, stopRecording };
}
