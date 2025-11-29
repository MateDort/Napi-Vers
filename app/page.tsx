import Link from "next/link";
import { getDailyPoem } from "@/lib/poemService";

// Force dynamic rendering since we need to fetch the daily poem
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  let poemData;
  let error: string | null = null;

  try {
    poemData = await getDailyPoem();
  } catch (err) {
    console.error("Error loading poem:", err);
    error = err instanceof Error ? err.message : "Failed to load poem";
    // If API keys are missing, show a helpful message
    if (error.includes("API_KEY") || error.includes("not set")) {
      error = "API keys are not configured. Please set GEMINI_API_KEY and SERPER_API_KEY in your environment variables.";
    }
  }

  // Show error message if poem failed to load
  if (error || !poemData) {
    return (
      <main className="min-h-screen bg-beige-light p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/30 rounded-lg p-8 md:p-12 shadow-lg text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Hiba történt</h1>
            <p className="text-gray-700 mb-4">{error || "Nem sikerült betölteni a verset."}</p>
            <p className="text-sm text-gray-600">
              Kérlek ellenőrizd a környezeti változókat (GEMINI_API_KEY, SERPER_API_KEY) a Vercel projekt beállításaiban.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-beige-light p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Light bulb and reason */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            <svg
              className="w-12 h-12 text-amber-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
            </svg>
          </div>
          <p className="text-lg md:text-xl text-gray-800 font-medium">
            {poemData.reason}
          </p>
        </div>

        {/* Poem */}
        <div className="bg-white/30 rounded-lg p-8 md:p-12 mb-8 shadow-lg">
          <div className="poem-text whitespace-pre-line">
            {poemData.poem}
          </div>
          <div className="author-name">
            {poemData.author}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/author/${poemData.authorSlug}`}
            className="bg-black text-white px-8 py-4 rounded-lg text-center font-medium hover:bg-gray-800 transition-colors"
          >
            A költő
          </Link>
          <Link
            href={`/poem/${poemData.poemSlug}`}
            className="bg-black text-white px-8 py-4 rounded-lg text-center font-medium hover:bg-gray-800 transition-colors"
          >
            A vers mögött
          </Link>
        </div>
      </div>
    </main>
  );
}

