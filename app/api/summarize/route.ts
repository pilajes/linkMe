import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY as string,
});

export async function POST(req: Request) {
    try {
        const { diff } = await req.json();

        if (!diff) {
            return NextResponse.json({ error: "No diff provided" }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Summarize the following diff from a commit for a LinkedIn post: ${diff}` }],
        });

        const summary = response.choices?.[0]?.message?.content?.trim() || "No summary available";

        return NextResponse.json({ summary }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}
