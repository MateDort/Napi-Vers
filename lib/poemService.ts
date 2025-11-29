import { getTodayPoem } from "./apiCache";

export interface PoemData {
  poem: string;
  author: string;
  authorSlug: string;
  poemSlug: string;
  reason: string;
  date: string;
}

export async function getDailyPoem(): Promise<PoemData> {
  // Try to get today's poem from cache/API
  try {
    const poemData = await getTodayPoem();
    return poemData;
  } catch (error) {
    console.error("Error fetching daily poem:", error);
    // Fallback to default poem
    return {
      poem: "Ma még nincs elérhető vers.\nKérjük, próbálja újra később.",
      author: "Vers App",
      authorSlug: "default",
      poemSlug: "default",
      reason: "A vers betöltése folyamatban...",
      date: new Date().toISOString().split("T")[0],
    };
  }
}

