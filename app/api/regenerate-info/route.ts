import { NextResponse } from "next/server";
import { getTodayPoem } from "@/lib/apiCache";
import { ensureAuthorAndPoemInfo } from "@/lib/dailyPoemGenerator";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    // Get today's poem
    const todayPoem = await getTodayPoem();
    
    // Force regenerate author and poem info
    await ensureAuthorAndPoemInfo(todayPoem);
    
    return NextResponse.json({
      success: true,
      message: "Author and poem info regeneration triggered",
    });
  } catch (error) {
    console.error("Error regenerating info:", error);
    return NextResponse.json(
      { error: "Failed to regenerate info" },
      { status: 500 }
    );
  }
}

