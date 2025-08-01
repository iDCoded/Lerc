async function initWhisper() {
	console.log("[WHISPER] WASM Initialized");
}

self.onmessage = async (event) => {
	const { type } = event.data;

	if (type === "init") {
		await initWhisper();
		self.postMessage({ type: "ready" });
	}

	if (type === "transcribe") {
		await initWhisper();
		self.postMessage({ type: "result", text: "[Text transcription here]" });
	}
};

export {};
