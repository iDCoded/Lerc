"use client";

import { Button } from "@/components/ui/button";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { PWARegistration } from "@/components/PWARegistration";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";

export function VoiceAssistant() {
	const {
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
	} = useVoiceAssistant();

	const conversationEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [conversation]);

	const formatLatency = (ms: number) => `${ms.toFixed(0)}ms`;

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
			<PWARegistration />
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
						Lerc Voice Assistant
					</h1>
					<p className="text-gray-600">
						Offline-capable voice assistant with local STT and TTS
					</p>
				</div>

				{/* Main Controls */}
				<div className="flex justify-center mb-8">
					<div className="flex items-center gap-4">
						{!isListening ? (
							<Button
								onClick={startListening}
								disabled={isProcessing || isSpeaking}
								className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl">
								<Mic className="h-8 w-8" />
							</Button>
						) : (
							<Button
								onClick={stopListening}
								className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl animate-pulse">
								<MicOff className="h-8 w-8" />
							</Button>
						)}

						<Button onClick={reset} variant="outline" className="h-12 px-4">
							<RotateCcw className="h-4 w-4 mr-2" />
							Reset
						</Button>
					</div>
				</div>

				{/* Status Indicators */}
				<div className="flex justify-center mb-6">
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-2">
							<div
								className={`w-3 h-3 rounded-full ${
									isListening ? "bg-green-500 animate-pulse" : "bg-gray-300"
								}`}
							/>
							<span className="text-sm text-gray-600">Listening</span>
						</div>
						<div className="flex items-center gap-2">
							<div
								className={`w-3 h-3 rounded-full ${
									isProcessing ? "bg-yellow-500 animate-pulse" : "bg-gray-300"
								}`}
							/>
							<span className="text-sm text-gray-600">Processing</span>
						</div>
						<div className="flex items-center gap-2">
							<div
								className={`w-3 h-3 rounded-full ${
									isSpeaking ? "bg-blue-500 animate-pulse" : "bg-gray-300"
								}`}
							/>
							<span className="text-sm text-gray-600">Speaking</span>
						</div>
					</div>
				</div>

				{/* Error Display */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
						<p className="text-red-700 text-sm">{error}</p>
					</div>
				)}

				{/* Current Interaction */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Transcript */}
					<div className="bg-white rounded-xl shadow-lg p-6">
						<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
							<Mic className="h-5 w-5 text-blue-500" />
							Your Message
						</h3>
						<div className="min-h-[100px] p-4 bg-gray-50 rounded-lg">
							{transcript ? (
								<p className="text-gray-800">{transcript}</p>
							) : (
								<p className="text-gray-400 italic">
									{isListening
										? "Listening..."
										: "Start speaking to see your message here"}
								</p>
							)}
						</div>
					</div>

					{/* Response */}
					<div className="bg-white rounded-xl shadow-lg p-6">
						<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
							<Volume2 className="h-5 w-5 text-purple-500" />
							Assistant Response
						</h3>
						<div className="min-h-[100px] p-4 bg-gray-50 rounded-lg">
							{response ? (
								<p className="text-gray-800">{response}</p>
							) : (
								<p className="text-gray-400 italic">
									{isProcessing ? "Processing..." : "Response will appear here"}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Performance Metrics */}
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
					<h3 className="text-lg font-semibold text-gray-800 mb-4">
						Performance Metrics
					</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{formatLatency(latencies.stt)}
							</div>
							<div className="text-sm text-gray-600">Speech-to-Text</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{formatLatency(latencies.api)}
							</div>
							<div className="text-sm text-gray-600">API Call</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{formatLatency(latencies.tts)}
							</div>
							<div className="text-sm text-gray-600">Text-to-Speech</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-orange-600">
								{formatLatency(latencies.total)}
							</div>
							<div className="text-sm text-gray-600">Total Time</div>
						</div>
					</div>
				</div>

				{/* Conversation History */}
				<div className="bg-white rounded-xl shadow-lg p-6">
					<h3 className="text-lg font-semibold text-gray-800 mb-4">
						Conversation History
					</h3>
					<div className="max-h-96 overflow-y-auto space-y-4">
						{conversation.length === 0 ? (
							<p className="text-gray-400 italic text-center py-8">
								Start a conversation to see the history here
							</p>
						) : (
							conversation.map((message, index) => (
								<div
									key={index}
									className={`flex ${
										message.role === "user" ? "justify-end" : "justify-start"
									}`}>
									<div
										className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
											message.role === "user"
												? "bg-blue-500 text-white"
												: "bg-gray-100 text-gray-800"
										}`}>
										<p className="text-sm">{message.content}</p>
										<p className="text-xs opacity-70 mt-1">
											{new Date(message.timestamp).toLocaleTimeString()}
										</p>
									</div>
								</div>
							))
						)}
						<div ref={conversationEndRef} />
					</div>
				</div>
			</div>
		</div>
	);
}
