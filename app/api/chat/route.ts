import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
	try {
		const { message } = await request.json();

		if (!message) {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 }
			);
		}

		const completion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content:
						"You are a helpful voice assistant. Keep responses concise and conversational.",
				},
				{
					role: "user",
					content: message,
				},
			],
			max_tokens: 150,
			temperature: 0.7,
		});

		const response =
			completion.choices[0]?.message?.content ||
			"I'm sorry, I couldn't process that.";

		return NextResponse.json({ response });
	} catch (error) {
		console.error("OpenAI API error:", error);
		return NextResponse.json(
			{ error: "Failed to get response from OpenAI" },
			{ status: 500 }
		);
	}
}
