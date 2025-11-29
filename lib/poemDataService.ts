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
  console.log(`[getPoemData] Looking for poem with slug: ${slug}`);
  
  // First, try to get from storage
  const stored = await getPoemDataFromStorage(slug);
  if (stored) {
    console.log(`[getPoemData] Found stored poem data for slug: ${slug}`);
    return stored;
  }

  console.log(`[getPoemData] No stored data found, checking today's poem...`);

  // Get today's poem
  try {
    const todayPoem = await getTodayPoem();
    console.log(`[getPoemData] Today's poem slug: ${todayPoem.poemSlug}, requested slug: ${slug}`);
    
    // Check if this slug matches today's poem
    if (todayPoem.poemSlug === slug) {
      console.log(`[getPoemData] Slug matches, generating poem info...`);
      // Generate poem info
      const poemTitle = todayPoem.poemTitle || todayPoem.poem.split("\n")[0] || "Vers";
      const poemInfo = await generatePoemInfo(
        poemTitle,
        todayPoem.author,
        todayPoem.poem
      );
      
      const poemData: PoemDataPage = {
        title: poemTitle,
        author: todayPoem.author,
        poem: todayPoem.poem,
        ...poemInfo,
      };
      
      // Save to storage
      await savePoemDataToStorage(slug, poemData);
      console.log(`[getPoemData] Generated and saved poem data for slug: ${slug}`);
      return poemData;
    } else {
      console.log(`[getPoemData] Slug mismatch - today's poem is different`);
    }
  } catch (error) {
    console.error("[getPoemData] Error getting poem data:", error);
  }

  console.log(`[getPoemData] Returning null for slug: ${slug}`);
  return null;
}

