import { getTodayPoem } from "./apiCache";
import { generateAuthorInfo } from "./gptService";
import { getAuthorFromStorage, saveAuthorToStorage } from "./authorStorage";

export interface AuthorData {
  name: string;
  biography: string;
  funFacts: string[];
}

export async function getAuthorData(slug: string): Promise<AuthorData | null> {
  // First, try to get from storage
  const stored = await getAuthorFromStorage(slug);
  if (stored) {
    return stored;
  }

  // Get today's poem to find the author
  try {
    const todayPoem = await getTodayPoem();
    
    // Check if this slug matches today's author
    if (todayPoem.authorSlug === slug) {
      // Generate author info
      const authorInfo = await generateAuthorInfo(todayPoem.author);
      const authorData: AuthorData = {
        name: todayPoem.author,
        ...authorInfo,
      };
      
      // Save to storage
      await saveAuthorToStorage(slug, authorData);
      return authorData;
    }
  } catch (error) {
    console.error("Error getting author data:", error);
  }

  return null;
}

