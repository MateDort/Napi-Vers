import { NextResponse } from "next/server";
import { getOrGenerateTodayPoem } from "@/lib/dailyPoemGenerator";

// Force dynamic rendering - this route should never be statically generated
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const poemData = await getOrGenerateTodayPoem();
    return NextResponse.json(poemData);
  } catch (error) {
    console.error("Error in /api/poem/today:", error);
    return NextResponse.json(
      { error: "Failed to fetch poem" },
      { status: 500 }
    );
  }
}

