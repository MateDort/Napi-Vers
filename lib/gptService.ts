import OpenAI from "openai";
import { HungarianEvent } from "./serperService";
import { PoemData } from "./poemService";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function selectAndGeneratePoem(
  events: HungarianEvent[]
): Promise<PoemData> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  // Create context from events
  const eventsContext = events
    .map((e) => `- ${e.title}: ${e.snippet}`)
    .join("\n");

  const prompt = `You are an expert on Hungarian poetry and literature. Based on the following events happening today in Hungary (especially related to literature, poets, and authors), select an appropriate famous Hungarian poem and provide information about it.

Events for today:
${eventsContext || "No specific events found, but please select a meaningful Hungarian poem."}

Please provide:
1. A reason for choosing this poem (e.g., "Today we celebrate [Author Name]'s birthday. [Poem Name] is one of her/his most famous poems.")
2. The full text of the poem in Hungarian
3. The author's name in Hungarian
4. A URL-friendly slug for the author (lowercase, hyphens, no special characters)
5. A URL-friendly slug for the poem (lowercase, hyphens, no special characters)

Respond in JSON format:
{
  "reason": "Today we celebrate...",
  "poem": "Full poem text here\nwith line breaks",
  "author": "Author Name",
  "authorSlug": "author-name",
  "poemSlug": "poem-name"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert on Hungarian poetry. Always respond with valid JSON only, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const poemData = JSON.parse(content) as Omit<PoemData, "date">;
    return {
      ...poemData,
      date: dateStr,
    };
  } catch (error) {
    console.error("Error generating poem with GPT:", error);
    // Fallback poem
    return {
      reason: "Ma egy klasszikus magyar verset mutatunk be.",
      poem: "Szeretném, ha szeretnének,\nSzeretném, ha szeretnék,\nSzeretném, ha szeretnénk,\nEgymást szeretni.",
      author: "József Attila",
      authorSlug: "jozsef-attila",
      poemSlug: "szeretnem-ha-szeretnenek",
      date: dateStr,
    };
  }
}

export async function generateAuthorInfo(authorName: string): Promise<{
  biography: string;
  funFacts: string[];
}> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const prompt = `Provide detailed information about the Hungarian poet/author: ${authorName}

Please provide:
1. A comprehensive biography (3-4 paragraphs)
2. At least 5 interesting fun facts about the author

Respond in JSON format:
{
  "biography": "Full biography text here...",
  "funFacts": ["Fact 1", "Fact 2", "Fact 3", "Fact 4", "Fact 5"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert on Hungarian literature. Always respond with valid JSON only, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);
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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const prompt = `Analyze this Hungarian poem:

Title: ${poemName}
Author: ${authorName}
Poem:
${poemText}

Please provide:
1. A detailed analysis of the poem (3-4 paragraphs covering themes, style, meaning)
2. At least 5 interesting fun facts about this specific poem

Respond in JSON format:
{
  "analysis": "Full analysis text here...",
  "funFacts": ["Fact 1", "Fact 2", "Fact 3", "Fact 4", "Fact 5"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert on Hungarian poetry analysis. Always respond with valid JSON only, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);
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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const messages = [
    {
      role: "system" as const,
      content: `You are a helpful assistant specializing in Hungarian literature. You are answering questions about the Hungarian poet/author: ${authorName}. Respond in Hungarian.`,
    },
    ...conversationHistory,
    {
      role: "user" as const,
      content: question,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages as any,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Nem tudok válaszolni erre a kérdésre.";
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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const messages = [
    {
      role: "system" as const,
      content: `You are a helpful assistant specializing in Hungarian poetry analysis. You are answering questions about this poem:

Title: ${poemName}
Author: ${authorName}
Poem:
${poemText}

Respond in Hungarian.`,
    },
    ...conversationHistory,
    {
      role: "user" as const,
      content: question,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages as any,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Nem tudok válaszolni erre a kérdésre.";
  } catch (error) {
    console.error("Error in poem chat:", error);
    return "Hiba történt a válasz generálása során.";
  }
}

