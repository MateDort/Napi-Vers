import { PoemData } from "./poemService";
import { getOrGenerateTodayPoem } from "./dailyPoemGenerator";

let cachedPoem: PoemData | null = null;
let cachedDate: string | null = null;

export async function getTodayPoem(): Promise<PoemData> {
  const today = new Date().toISOString().split("T")[0];

  // Check if we have a cached poem for today
  if (cachedPoem && cachedDate === today) {
    return cachedPoem;
  }

  // Call the function directly instead of making an HTTP request
  // This works both at build time and runtime
  try {
    const poemData = await getOrGenerateTodayPoem();
    cachedPoem = poemData;
    cachedDate = today;
    return poemData;
  } catch (error) {
    console.error("Error getting poem:", error);
    throw error;
  }
}

