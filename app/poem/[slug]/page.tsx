import { notFound } from "next/navigation";
import { getPoemData } from "@/lib/poemDataService";
import PoemChat from "@/components/PoemChat";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PoemPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;
    console.log(`[PoemPage] Loading page for slug: ${slug}`);
    
    const poemData = await getPoemData(slug);

    if (!poemData) {
      console.log(`[PoemPage] No poem data found for slug: ${slug}, showing 404`);
      notFound();
    }

    console.log(`[PoemPage] Successfully loaded poem data for slug: ${slug}`);

  return (
    <main className="min-h-screen bg-beige-light p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          {poemData.title}
        </h1>

        {/* Analysis */}
        <div className="bg-white/30 rounded-lg p-6 md:p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Elemzés</h2>
          <div className="prose prose-lg max-w-none">
            {poemData.analysis && poemData.analysis.split("\n\n").filter(p => p.trim()).map((para, idx) => (
              <p key={idx} className="mb-4 text-gray-800">
                {para.trim()}
              </p>
            ))}
          </div>
        </div>

        {/* Fun Facts */}
        {poemData.funFacts && poemData.funFacts.length > 0 && (
          <div className="bg-white/30 rounded-lg p-6 md:p-8 mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Érdekes tények</h2>
            <ul className="space-y-3">
              {poemData.funFacts.map((fact, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-800">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Chat */}
        <div className="bg-white/30 rounded-lg p-6 md:p-8 shadow-lg">
          <PoemChat
            poemName={poemData.title}
            authorName={poemData.author}
            poemText={poemData.poem}
          />
        </div>
      </div>
    </main>
  );
  } catch (error) {
    console.error("[PoemPage] Error loading poem page:", error);
    notFound();
  }
}

