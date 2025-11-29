import { PoemData } from "./poemService";

let cachedPoem: PoemData | null = null;
let cachedDate: string | null = null;

export async function getTodayPoem(): Promise<PoemData> {
  const today = new Date().toISOString().split("T")[0];

  // Check if we have a cached poem for today
  if (cachedPoem && cachedDate === today) {
    return cachedPoem;
  }

  // Fetch from API
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/poem/today`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch poem");
    }

    const poemData = await response.json();
    cachedPoem = poemData;
    cachedDate = today;
    return poemData;
  } catch (error) {
    console.error("Error fetching poem:", error);
    throw error;
  }
}

