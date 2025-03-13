import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Home Link */}
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          Pokémon TCG Tracker
        </Link>

        {/* Navigation Links */}
        <div className="space-x-4">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link href="/collection" className="hover:text-gray-300">
            Collection
          </Link>
          <Link href="/expansions" className="hover:text-gray-300">
            Expansions
          </Link>
          <Link href="/search" className="hover:text-gray-300">Search</Link>
        </div>
      </div>
    </nav>
  );
}
