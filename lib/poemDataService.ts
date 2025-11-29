import { getTodayPoem } from "./apiCache";
import { generatePoemInfo } from "./gptService";
import { getPoemDataFromStorage, savePoemDataToStorage } from "./poemDataStorage";

export interface PoemDataPage {
  title: string;
  author: string;
  poem: string;
  analysis: string;
  funFacts: string[];
}

export async function getPoemData(slug: string): Promise<PoemDataPage | null> {
  // First, try to get from storage
  const stored = await getPoemDataFromStorage(slug);
  if (stored) {
    return stored;
  }

  // Get today's poem
  try {
    const todayPoem = await getTodayPoem();
    
    // Check if this slug matches today's poem
    if (todayPoem.poemSlug === slug) {
      // Generate poem info
      const poemInfo = await generatePoemInfo(
        todayPoem.poem.split("\n")[0] || "Vers",
        todayPoem.author,
        todayPoem.poem
      );
      
      const poemData: PoemDataPage = {
        title: todayPoem.poem.split("\n")[0] || "Vers",
        author: todayPoem.author,
        poem: todayPoem.poem,
        ...poemInfo,
      };
      
      // Save to storage
      await savePoemDataToStorage(slug, poemData);
      return poemData;
    }
  } catch (error) {
    console.error("Error getting poem data:", error);
  }

  return null;
}

