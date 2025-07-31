self.onmessage = async (event) => {
	const { type, audioBlob } = event.data;

	if (type === "transcribe") {
		// TODO: Load Whisper WASM and run transcription
		await new Promise((r) => setTimeout(r, 1000));
		self.postMessage({ text: "This is a fake transcript for now" });
	}
};

export {};
