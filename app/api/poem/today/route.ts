import { NextResponse } from "next/server";
import { getOrGenerateTodayPoem } from "@/lib/dailyPoemGenerator";

// Force dynamic rendering - this route should never be statically generated
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize cron only in runtime (not during build)
// Cron will be initialized when this route is first accessed at runtime
if (typeof window === 'undefined') {
  // Use dynamic import to prevent build-time execution
  import("@/lib/initCron").catch(() => {
    // Silently fail if cron can't be initialized (e.g., during build)
  });
}

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

