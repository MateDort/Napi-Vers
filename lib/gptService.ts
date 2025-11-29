import { GoogleGenerativeAI } from "@google/generative-ai";
import { HungarianEvent } from "./serperService";
import { PoemData } from "./poemService";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Function to clean markdown formatting from responses
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, "") // Remove bold markdown
    .replace(/#{1,6}\s/g, "") // Remove headers (###, ##, #)
    .replace(/\*\s/g, "") // Remove bullet points
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`/g, "") // Remove inline code
    .trim();
}

export async function selectAndGeneratePoem(
  events: HungarianEvent[]
): Promise<PoemData> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const monthNames = ["január", "február", "március", "április", "május", "június", 
                      "július", "augusztus", "szeptember", "október", "november", "december"];
  const todayFormatted = `${year}. ${monthNames[month - 1]} ${day}.`;

  // Create context from events, marking which ones explicitly mention today's date
  const eventsContext = events
    .map((e) => {
      const marker = e.date ? " [MAI ESEMÉNY - konkrét dátummal]" : " [lehetséges esemény]";
      return `- ${e.title}: ${e.snippet}${marker}`;
    })
    .join("\n");

  const prompt = `Te egy magyar irodalom és költészet szakértője vagy. A mai napon (${todayFormatted}) Magyarországon történő események (különösen az irodalommal, költőkkel és írókkal kapcsolatos) alapján válassz ki egy megfelelő híres magyar verset és adj információt róla.

FONTOS SZABÁLYOK - EZEKET KÖTELEZŐEN KÖVESD:
- CSAK akkor mondd, hogy "Ma ünnepeljük [név] születésnapját", ha az esemény mellett "[MAI ESEMÉNY - konkrét dátummal]" jelölés szerepel
- Ha egy esemény mellett "[lehetséges esemény]" jelölés van, azt NE használd "ma ünnepeljük" formában, mert nincs bizonyíték, hogy ma van
- NE találj ki dátumokat! Ha az események nem tartalmaznak konkrét dátumot vagy "[MAI ESEMÉNY]" jelölést, NE mondd, hogy ma van valakinek a születésnapja
- Ha nincs "[MAI ESEMÉNY]" jelölésű esemény, akkor válassz egy verset más okból (pl. "Ez a vers fontos szerepet játszik a magyar irodalomban" vagy "Ez a vers kapcsolódik a mai naphoz valamilyen más módon")
- A "reason" mezőben CSAK akkor használd a "Ma ünnepeljük" kifejezést, ha az esemény "[MAI ESEMÉNY - konkrét dátummal]" jelöléssel rendelkezik

Mai események (${todayFormatted}):
${eventsContext || "Nem találhatók konkrét események, de kérlek válassz egy jelentős magyar verset."}

Kérlek add meg:
1. A vers kiválasztásának okát magyarul. CSAK akkor írd, hogy "Ma ünnepeljük [név] születésnapját", ha az események listájában KONKRÉTAN szerepel, hogy ma (${month}. ${day}.) van a születésnapja. Egyébként használj más indoklást!
2. A vers CÍMÉT magyarul (csak a cím, nem a teljes vers)
3. A vers teljes szövegét magyarul
4. A szerző nevét magyarul
5. Egy URL-barát slug-ot a szerzőhöz (kisbetű, kötőjelek, nincs speciális karakter)
6. Egy URL-barát slug-ot a vershez (kisbetű, kötőjelek, nincs speciális karakter)

Válaszolj JSON formátumban:
{
  "reason": "Ma ünnepeljük... VAGY más indoklás, ha nincs konkrét mai esemény",
  "poemTitle": "Vers címe",
  "poem": "Teljes vers szöveg itt\\nsortörésekkel",
  "author": "Szerző neve",
  "authorSlug": "szerzo-neve",
  "poemSlug": "vers-neve"
}

MINDEN válaszodnak magyarul kell lennie!`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No response from Gemini");
    }

    // Extract JSON from response (might have markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }

    const poemData = JSON.parse(jsonContent) as Omit<PoemData, "date">;
    return {
      ...poemData,
      date: dateStr,
    };
  } catch (error) {
    console.error("Error generating poem with Gemini:", error);
    throw error;
  }
}

export async function generateAuthorInfo(authorName: string): Promise<{
  biography: string;
  funFacts: string[];
}> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const prompt = `Adj részletes információt erről a magyar költőről/íróról: ${authorName}

Kérlek add meg:
1. Egy átfogó életrajzot (3-4 bekezdés) MAGYARUL
2. Legalább 5 érdekes tényt a szerzőről MAGYARUL

FONTOS:
- MINDEN válaszodnak magyarul kell lennie!
- NE használj markdown formázást (nincs **, ###, *, stb.)
- Egyszerű szövegként írd meg

Válaszolj JSON formátumban:
{
  "biography": "Teljes életrajz szöveg itt magyarul...",
  "funFacts": ["Tény 1", "Tény 2", "Tény 3", "Tény 4", "Tény 5"]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No response from Gemini");
    }

    // Extract JSON from response
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(jsonContent);
    // Clean markdown from biography and funFacts
    if (parsed.biography) {
      parsed.biography = cleanMarkdown(parsed.biography);
    }
    if (parsed.funFacts && Array.isArray(parsed.funFacts)) {
      parsed.funFacts = parsed.funFacts.map((fact: string) => cleanMarkdown(fact));
    }
    return parsed;
  } catch (error) {
    console.error("Error generating author info:", error);
    return {
      biography: "Információk betöltése...",
      funFacts: [],
    };
  }
}

export async function generatePoemInfo(
  poemName: string,
  authorName: string,
  poemText: string
): Promise<{
  analysis: string;
  funFacts: string[];
}> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const prompt = `Elemezd ezt a magyar verset:

Cím: ${poemName}
Szerző: ${authorName}
Vers:
${poemText}

Kérlek add meg:
1. Egy részletes elemzést a versről (3-4 bekezdés, témák, stílus, jelentés) MAGYARUL
2. Legalább 5 érdekes tényt erről a konkrét versről MAGYARUL

FONTOS:
- MINDEN válaszodnak magyarul kell lennie!
- NE használj markdown formázást (nincs **, ###, *, stb.)
- Egyszerű szövegként írd meg

Válaszolj JSON formátumban:
{
  "analysis": "Teljes elemzés szöveg itt magyarul...",
  "funFacts": ["Tény 1", "Tény 2", "Tény 3", "Tény 4", "Tény 5"]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No response from Gemini");
    }

    // Extract JSON from response
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(jsonContent);
    // Clean markdown from analysis and funFacts
    if (parsed.analysis) {
      parsed.analysis = cleanMarkdown(parsed.analysis);
    }
    if (parsed.funFacts && Array.isArray(parsed.funFacts)) {
      parsed.funFacts = parsed.funFacts.map((fact: string) => cleanMarkdown(fact));
    }
    return parsed;
  } catch (error) {
    console.error("Error generating poem info:", error);
    return {
      analysis: "Elemzés betöltése...",
      funFacts: [],
    };
  }
}

export async function chatAboutAuthor(
  authorName: string,
  question: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const systemPrompt = `Te egy segítőkész asszisztens vagy, aki a magyar irodalom szakértője. Kérdésekre válaszolsz a magyar költőről/íróról: ${authorName}. 

FONTOS:
- MINDIG magyarul válaszolj!
- Válaszolj RÖVIDEN és TÖMÖREN (2-3 mondat, maximum 100 szó)
- Ne használj markdown formázást (nincs **, ###, stb.)
- Válaszolj közvetlenül, beszélgetős stílusban`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    // Build conversation history
    const history = conversationHistory.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const fullPrompt = `${systemPrompt}\n\nFelhasználó kérdése: ${question}`;
    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;
    const rawText = response.text() || "Nem tudok válaszolni erre a kérdésre.";
    
    // Clean markdown and return
    return cleanMarkdown(rawText);
  } catch (error) {
    console.error("Error in author chat:", error);
    return "Hiba történt a válasz generálása során.";
  }
}

export async function chatAboutPoem(
  poemName: string,
  authorName: string,
  poemText: string,
  question: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const systemPrompt = `Te egy segítőkész asszisztens vagy, aki a magyar költészet elemzésének szakértője. Kérdésekre válaszolsz erről a versről:

Cím: ${poemName}
Szerző: ${authorName}
Vers:
${poemText}

FONTOS:
- MINDIG magyarul válaszolj!
- Válaszolj RÖVIDEN és TÖMÖREN (2-3 mondat, maximum 100 szó)
- Ne használj markdown formázást (nincs **, ###, stb.)
- Válaszolj közvetlenül, beszélgetős stílusban`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    // Build conversation history
    const history = conversationHistory.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const fullPrompt = `${systemPrompt}\n\nFelhasználó kérdése: ${question}`;
    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;
    const rawText = response.text() || "Nem tudok válaszolni erre a kérdésre.";
    
    // Clean markdown and return
    return cleanMarkdown(rawText);
  } catch (error) {
    console.error("Error in poem chat:", error);
    return "Hiba történt a válasz generálása során.";
  }
}
