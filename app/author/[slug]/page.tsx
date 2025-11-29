import { notFound } from "next/navigation";
import { getAuthorData } from "@/lib/authorService";
import AuthorChat from "@/components/AuthorChat";

export default async function AuthorPage({
  params,
}: {
  params: { slug: string };
}) {
  const authorData = await getAuthorData(params.slug);

  if (!authorData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-beige-light p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          {authorData.name}
        </h1>

        {/* Biography */}
        <div className="bg-white/30 rounded-lg p-6 md:p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Életrajz</h2>
          <div className="prose prose-lg max-w-none">
            {authorData.biography.split("\n\n").map((para, idx) => (
              <p key={idx} className="mb-4 text-gray-800">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Fun Facts */}
        {authorData.funFacts && authorData.funFacts.length > 0 && (
          <div className="bg-white/30 rounded-lg p-6 md:p-8 mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Érdekes tények</h2>
            <ul className="space-y-3">
              {authorData.funFacts.map((fact, idx) => (
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
          <AuthorChat authorName={authorData.name} />
        </div>
      </div>
    </main>
  );
}

