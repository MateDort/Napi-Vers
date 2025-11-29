import { NextResponse } from "next/server";
import { chatAboutAuthor } from "@/lib/gptService";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { authorName, question, conversationHistory } = await request.json();

    if (!authorName || !question) {
      return NextResponse.json(
        { error: "Missing authorName or question" },
        { status: 400 }
      );
    }

    const response = await chatAboutAuthor(
      authorName,
      question,
      conversationHistory || []
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in /api/chat/author:", error);
    return NextResponse.json(
      { error: "Failed to get chat response" },
      { status: 500 }
    );
  }
}

