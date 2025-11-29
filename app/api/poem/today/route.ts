import { NextResponse } from "next/server";
import { getOrGenerateTodayPoem } from "@/lib/dailyPoemGenerator";
import "@/lib/initCron";

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

