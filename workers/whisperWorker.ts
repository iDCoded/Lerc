/// <reference lib="webworker"/>

importScripts("/whisper/helpers.js");
importScripts("/whisper/libmain.js");

let Module: any;

self.onmessage = async (event) => {
	const { type, audioBuffer } = event.data;

	if (type === "init") {
		(self as any).Module = {
			onRuntimeInitialized: () => {
				console.log("[WHISPER] WASM Runtime Initialized");
				self.postMessage({ type: "ready" });
			},
		};
	}

	if (type === "transcribe") {
		if (!Module) {
			self.postMessage({ type: "error", error: "Whisper not initialized" });
			return;
		}

		self.postMessage({ type: "result", text: "[Transcription result here]" });
	}
};

export {};
