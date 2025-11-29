import { NextResponse } from "next/server";
import { getOrGenerateTodayPoem } from "@/lib/dailyPoemGenerator";

export async function GET(request: Request) {
  // Check for authorization header (only required in production with CRON_SECRET set)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isDevelopment = process.env.NODE_ENV === "development";

  // Only require auth if CRON_SECRET is set and we're not in development
  if (cronSecret && !isDevelopment && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Generate today's poem
    const poemData = await getOrGenerateTodayPoem();
    return NextResponse.json({
      success: true,
      message: "Poem generated successfully",
      poem: poemData,
    });
  } catch (error) {
    console.error("Error generating poem:", error);
    return NextResponse.json(
      { error: "Failed to generate poem" },
      { status: 500 }
    );
  }
}

