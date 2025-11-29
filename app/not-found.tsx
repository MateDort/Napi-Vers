import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-beige-light flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Az oldal nem található</p>
        <Link
          href="/"
          className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </main>
  );
}

