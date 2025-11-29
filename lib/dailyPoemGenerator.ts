import { PoemData } from "./poemService";
import { checkHungarianEvents } from "./serperService";
import { selectAndGeneratePoem, generateAuthorInfo, generatePoemInfo } from "./gptService";
import { savePoemToStorage, getPoemFromStorage } from "./storage";
import { saveAuthorToStorage } from "./authorStorage";
import { savePoemDataToStorage } from "./poemDataStorage";

export async function getOrGenerateTodayPoem(): Promise<PoemData> {
  const today = new Date().toISOString().split("T")[0];

  // Check if we already have a poem for today
  const storedPoem = await getPoemFromStorage(today);
  if (storedPoem) {
    return storedPoem;
  }

  // Generate new poem for today
  return await generateTodayPoem();
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
      await saveAuthorToStorage(poemData.authorSlug, {
        name: poemData.author,
        ...authorInfo,
      });
      console.log(`Author info generated for ${poemData.author}`);
    } catch (error) {
      console.error("Error generating author info:", error);
      // Continue even if author info generation fails
    }

    // Step 5: Generate and save poem info automatically
    try {
      const poemTitle = poemData.poem.split("\n")[0] || "Vers";
      const poemInfo = await generatePoemInfo(
        poemTitle,
        poemData.author,
        poemData.poem
      );
      await savePoemDataToStorage(poemData.poemSlug, {
        title: poemTitle,
        author: poemData.author,
        poem: poemData.poem,
        ...poemInfo,
      });
      console.log(`Poem info generated for ${poemTitle}`);
    } catch (error) {
      console.error("Error generating poem info:", error);
      // Continue even if poem info generation fails
    }

    return poemData;
  } catch (error) {
    console.error("Error generating today's poem:", error);
    throw error;
  }
}

