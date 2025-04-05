import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Card {
  id: string;
  name: string;
  expansion_id: string;
  number: string;
  rarity: string | null;
  supertype: string;
  hp: string | null;
  types: string | null;
  image_url: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState("");
  const [type_, setType_] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length < 1) return;

    setLoading(true);
    let url = BACKEND_URL + `/search/cards/?q=${query}`;
    if (rarity) url += `&rarity=${rarity}`;
    if (type_) url += `&type_=${type_}`;

    const res = await fetch(url);
    const data = await res.json();
    setCards(data.cards || []);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Search Pokémon Cards</h1>

      {/* Search Form with Filters */}
      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a card..."
          className="border p-2 w-full md:w-1/3 rounded-lg"
        />

        {/* Rarity Filter */}
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">All Rarities</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="legendary">Legendary</option>
        </select>

        {/* Type Filter */}
        <select
          value={type_}
          onChange={(e) => setType_(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">All Types</option>
          <option value="grass">Grass</option>
          <option value="fire">Fire</option>
          <option value="water">Water</option>
          <option value="lightning">Lightning</option>
          <option value="psychic">Psychic</option>
          <option value="fighting">Fighting</option>
          <option value="darkness">Darkness</option>
          <option value="metal">Metal</option>
          <option value="dragon">Dragon</option>
          <option value="fairy">Fairy</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}

      {/* Card List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="border p-3 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition"
            onClick={() => setSelectedCard(card)}
          >
            <img src={card.image_url} alt={card.name} className="w-full h-48 object-contain" />
            <h2 className="text-lg font-semibold mt-2">{card.name}</h2>
            <p className="text-sm text-gray-500">#{card.number} - {card.rarity || "Common"}</p>
          </div>
        ))}
      </div>

      {/* Card Detail Modal */}
      <Transition show={!!selectedCard} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedCard(null)}>
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md transition-opacity" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
              >
                ✕
              </button>

              {/* Card Image */}
              <img
                src={selectedCard?.image_url}
                alt={selectedCard?.name}
                className="w-full h-[500px] object-contain"
              />

              <h2 className="text-2xl font-bold mt-4">{selectedCard?.name}</h2>
              <p className="text-sm text-gray-500">
                #{selectedCard?.number} - {selectedCard?.rarity || "Common"}
              </p>
              <p className="mt-2">
                <strong>HP:</strong> {selectedCard?.hp || "N/A"}
              </p>
              <p className="mt-1">
                <strong>Type:</strong> {selectedCard?.types || "N/A"}
              </p>
              <p className="mt-1">
                <strong>Supertype:</strong> {selectedCard?.supertype}
              </p>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
