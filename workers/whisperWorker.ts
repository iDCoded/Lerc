interface WhisperMessage {
	type: string;
	audioBuffer?: ArrayBuffer;
}

interface WhisperResponse {
	type: string;
	text?: string;
	error?: string;
	duration?: number;
}

class WhisperWorker {
	private whisperModule: any = null;
	private isInitialized = false;

	async init() {
		if (this.isInitialized) return;

		try {
			// Load Whisper WASM module
			const response = await fetch("/whisper/libmain.wasm");
			const wasmBuffer = await response.arrayBuffer();

			// Initialize the module (this is a simplified version)
			// In a real implementation, you'd load the actual Whisper WASM module
			this.whisperModule = {
				// Mock implementation for now
				transcribe: async (audioData: Float32Array) => {
					// Simulate processing time
					await new Promise((resolve) => setTimeout(resolve, 100));
					return "Hello, this is a test transcription.";
				},
			};

			this.isInitialized = true;
			console.log("[WHISPER] Initialized successfully");
		} catch (error) {
			console.error("[WHISPER] Initialization failed:", error);
			throw error;
		}
	}

	async transcribe(audioBuffer: ArrayBuffer): Promise<string> {
		if (!this.isInitialized) {
			await this.init();
		}

		try {
			// Convert audio buffer to Float32Array
			const audioContext = new AudioContext();
			const audioData = await audioContext.decodeAudioData(audioBuffer);
			const float32Array = audioData.getChannelData(0);

			// Transcribe using Whisper
			const result = await this.whisperModule.transcribe(float32Array);
			return result;
		} catch (error) {
			console.error("[WHISPER] Transcription failed:", error);
			throw error;
		}
	}
}

const whisperWorker = new WhisperWorker();

self.onmessage = async (event: MessageEvent<WhisperMessage>) => {
	const { type, audioBuffer } = event.data;

	if (type === "init") {
		try {
			await whisperWorker.init();
			self.postMessage({ type: "ready" });
		} catch (error) {
			self.postMessage({
				type: "error",
				error: error instanceof Error ? error.message : "Initialization failed",
			});
		}
	}

	if (type === "transcribe" && audioBuffer) {
		try {
			const startTime = performance.now();
			const text = await whisperWorker.transcribe(audioBuffer);
			const endTime = performance.now();

			self.postMessage({
				type: "result",
				text,
				duration: endTime - startTime,
			} as WhisperResponse);
		} catch (error) {
			self.postMessage({
				type: "error",
				error: error instanceof Error ? error.message : "Transcription failed",
			} as WhisperResponse);
		}
	}
};

export {};
