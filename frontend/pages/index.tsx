import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Pokémon TCG Tracker</h1>
      <p className="text-lg text-gray-600 mb-6">Track your collection, explore expansions, and build decks.</p>
      <Link href="/expansions" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
        View Expansions
      </Link>
    </div>
  );
}
