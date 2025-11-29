import { getTodayPoem } from "./apiCache";

export interface PoemData {
  poem: string;
  poemTitle: string;
  author: string;
  authorSlug: string;
  poemSlug: string;
  reason: string;
  date: string;
}

export async function getDailyPoem(): Promise<PoemData> {
  // Get today's poem from cache/API
  const poemData = await getTodayPoem();
  return poemData;
}

