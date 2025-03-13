import { useState } from "react";

interface Card {
  id: string;
  name: string;
  image_url: string;
  expansion_id: string;
  number: string;
}

interface CardSearchProps {
  onCardSelect: (card: Card) => void;
}

export default function CardSearch({ onCardSelect }: CardSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/search/cards?q=${query}`);
      const data = await res.json();
      setResults(data.cards || []);
    } catch (error) {
      console.error("Search error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Search for a Card</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Enter card name..."
          className="border p-2 rounded flex-grow"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && <p className="mt-2 text-gray-500">Loading...</p>}

      <div className="mt-3">
        {results.map((card) => (
          <div
            key={card.id}
            className="flex items-center p-2 border-b cursor-pointer hover:bg-gray-100"
            onClick={() => onCardSelect(card)}
          >
            <img src={card.image_url} alt={card.name} className="w-16 h-16 object-contain mr-2" />
            <div>
              <p className="font-semibold">{card.name}</p>
              <p className="text-sm text-gray-500">#{card.number} - {card.expansion_id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
