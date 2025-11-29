import { NextResponse } from "next/server";
import { chatAboutPoem } from "@/lib/gptService";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { poemName, authorName, poemText, question, conversationHistory } =
      await request.json();

    if (!poemName || !authorName || !poemText || !question) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await chatAboutPoem(
      poemName,
      authorName,
      poemText,
      question,
      conversationHistory || []
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in /api/chat/poem:", error);
    return NextResponse.json(
      { error: "Failed to get chat response" },
      { status: 500 }
    );
  }
}

