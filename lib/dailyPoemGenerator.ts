import { PoemData } from "./poemService";
import { checkHungarianEvents } from "./serperService";
import { selectAndGeneratePoem, generateAuthorInfo, generatePoemInfo } from "./gptService";
import { savePoemToStorage, getPoemFromStorage } from "./storage";
import { saveAuthorToStorage, getAuthorFromStorage } from "./authorStorage";
import { savePoemDataToStorage, getPoemDataFromStorage } from "./poemDataStorage";

export async function getOrGenerateTodayPoem(): Promise<PoemData> {
  const today = new Date().toISOString().split("T")[0];

  // Check if we already have a poem for today
  const storedPoem = await getPoemFromStorage(today);
  if (storedPoem) {
    // Ensure author and poem info are generated even if poem exists
    await ensureAuthorAndPoemInfo(storedPoem);
    return storedPoem;
  }

  // Generate new poem for today
  return await generateTodayPoem();
}

export async function ensureAuthorAndPoemInfo(poemData: PoemData): Promise<void> {
  // Check and generate author info if missing or incomplete
  const authorExists = await getAuthorFromStorage(poemData.authorSlug);
  const needsAuthorInfo = !authorExists || 
    !authorExists.biography || 
    authorExists.biography.includes("Információk betöltése") ||
    !authorExists.funFacts || 
    authorExists.funFacts.length === 0;
  
  if (needsAuthorInfo) {
    try {
      console.log(`Generating author info for ${poemData.author}`);
      const authorInfo = await generateAuthorInfo(poemData.author);
      
      // Check if we got real data or placeholder
      const isPlaceholder = authorInfo.biography.includes("Információk betöltése") || 
                           authorInfo.funFacts.length === 0;
      
      if (isPlaceholder) {
        console.warn(`Failed to generate author info for ${poemData.author} - API key may be invalid`);
      } else {
        await saveAuthorToStorage(poemData.authorSlug, {
          name: poemData.author,
          ...authorInfo,
        });
        console.log(`✓ Author info generated successfully for ${poemData.author}`);
      }
    } catch (error) {
      console.error(`✗ Error generating author info for ${poemData.author}:`, error);
    }
  }

  // Check and generate poem info if missing or incomplete
  const poemInfoExists = await getPoemDataFromStorage(poemData.poemSlug);
  const needsPoemInfo = !poemInfoExists ||
    !poemInfoExists.analysis ||
    poemInfoExists.analysis.includes("Elemzés betöltése") ||
    !poemInfoExists.funFacts ||
    poemInfoExists.funFacts.length === 0;
  
  if (needsPoemInfo) {
    try {
      const poemTitle = poemData.poemTitle || poemData.poem.split("\n")[0] || "Vers";
      console.log(`Generating poem info for ${poemTitle}`);
      const poemInfo = await generatePoemInfo(
        poemTitle,
        poemData.author,
        poemData.poem
      );
      
      // Check if we got real data or placeholder
      const isPlaceholder = poemInfo.analysis.includes("Elemzés betöltése") || 
                           poemInfo.funFacts.length === 0;
      
      if (isPlaceholder) {
        console.warn(`Failed to generate poem info for ${poemTitle} - API key may be invalid`);
      } else {
        await savePoemDataToStorage(poemData.poemSlug, {
          title: poemTitle,
          author: poemData.author,
          poem: poemData.poem,
          ...poemInfo,
        });
        console.log(`✓ Poem info generated successfully for ${poemTitle}`);
      }
    } catch (error) {
      console.error(`✗ Error generating poem info:`, error);
    }
  }
}

async function generateTodayPoem(): Promise<PoemData> {
  try {
    // Step 1: Check for Hungarian events using Serper API
    const events = await checkHungarianEvents();

    // Step 2: Use GPT to select and generate poem content
    const poemData = await selectAndGeneratePoem(events);

    // Step 3: Save poem to storage
    await savePoemToStorage(poemData.date, poemData);

    // Step 4: Generate and save author info automatically
    try {
      const authorInfo = await generateAuthorInfo(poemData.author);
      
      // Check if we got real data or placeholder
      const isPlaceholder = authorInfo.biography.includes("Információk betöltése") || 
                           authorInfo.funFacts.length === 0;
      
      if (!isPlaceholder) {
        await saveAuthorToStorage(poemData.authorSlug, {
          name: poemData.author,
          ...authorInfo,
        });
        console.log(`✓ Author info generated successfully for ${poemData.author}`);
      } else {
        console.warn(`⚠ Failed to generate author info for ${poemData.author} - API key may be invalid`);
      }
    } catch (error) {
      console.error(`✗ Error generating author info for ${poemData.author}:`, error);
      // Continue even if author info generation fails
    }

    // Step 5: Generate and save poem info automatically
    try {
      const poemTitle = poemData.poemTitle || poemData.poem.split("\n")[0] || "Vers";
      const poemInfo = await generatePoemInfo(
        poemTitle,
        poemData.author,
        poemData.poem
      );
      
      // Check if we got real data or placeholder
      const isPlaceholder = poemInfo.analysis.includes("Elemzés betöltése") || 
                           poemInfo.funFacts.length === 0;
      
      if (!isPlaceholder) {
        await savePoemDataToStorage(poemData.poemSlug, {
          title: poemTitle,
          author: poemData.author,
          poem: poemData.poem,
          ...poemInfo,
        });
        console.log(`✓ Poem info generated successfully for ${poemTitle}`);
      } else {
        console.warn(`⚠ Failed to generate poem info for ${poemTitle} - API key may be invalid`);
      }
    } catch (error) {
      console.error(`✗ Error generating poem info:`, error);
      // Continue even if poem info generation fails
    }

    return poemData;
  } catch (error) {
    console.error("Error generating today's poem:", error);
    throw error;
  }
}

