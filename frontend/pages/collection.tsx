import { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { rarityMap } from "@/config/rarities";

interface Card {
  card_id: string;
  name: string;
  type: string;
  color: string | null;
  rarity: string | null;
  image_url: string;
  quantity: number;
  collection_number: number;
}

interface Expansion {
  id: string;
  name: string;
  ptcgo_code: string;
}

interface CollectionStats {
  total: string;
  rarities: Record<string, string>;
}

export default function CollectionPage() {
  const [collection, setCollection] = useState<Card[]>([]);
  const [expansions, setExpansions] = useState<Expansion[]>([]);
  const [selectedExpansion, setSelectedExpansion] = useState<string>("");
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/expansions/")
      .then((res) => res.json())
      .then((data) => {
        const expansionList = Object.values(data.expansions).flat();
        setExpansions(expansionList);
        if (expansionList.length > 0) setSelectedExpansion(expansionList[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedExpansion) return;
    fetch(`http://localhost:8000/collection/${selectedExpansion}/`)
      .then((res) => res.json())
      .then((data) => {
        setCollection(data.collection);
        setStats(data.stats);
      });
  }, [selectedExpansion]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Collection</h1>

      {/* Top Bar with Expansion Dropdown & Stats */}
      <div className="flex justify-between mb-4">
        {/* Left Side: Stats Box (Taller & Stretched) */}
        {stats && (
          <div className="flex flex-col bg-gray-100 p-4 rounded-lg shadow min-h-[80px] border border-gray-300 mr-2 self-stretch">
            {/* Total Count */}
            <p className="font-bold mb-2">Total: {stats.total}</p>

            {/* Rarity Icons Below */}
            <div className="flex space-x-3">
              {Object.entries(stats.rarities).map(([rarity, count]) => {
                const rarityData = rarityMap[rarity] || { name: rarity };
                return (
                  <div key={rarity} className="flex items-center space-x-1 text-sm">
                    {rarityData.image ? (
                      <img
                        src={rarityData.image}
                        alt={rarityData.name}
                        title={rarityData.name} // Hover tooltip
                        className="w-4 h-4"
                      />
                    ) : (
                      <span className="font-semibold">{rarityData.name}</span>
                    )}
                    <span>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Side: Expansion Dropdown (Aligned to Bottom) */}
        <div className="flex self-end">
          <select
            value={selectedExpansion}
            onChange={(e) => setSelectedExpansion(e.target.value)}
            className="border p-2 rounded-lg"
          >
            {expansions.map((expansion) => (
              <option key={expansion.id} value={expansion.id}>
                {expansion.name} ({expansion.ptcgo_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Collection Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">#</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Card Name</th>
            <th className="p-2">Type</th>
            <th className="p-2">Color</th>
            <th className="p-2">Rarity</th>
            <th className="p-2">View</th>
          </tr>
        </thead>
        <tbody>
  {collection.map((card) => (
    <tr key={card.card_id} className="border-t">
      <td className="p-2 text-center">{card.collection_number}</td>

      {/* Quantity Column with +/- Buttons */}
      <td className="p-2 text-center flex items-center justify-center space-x-2">
        <button
          onClick={() =>
            setCollection((prevCollection) =>
              prevCollection.map((c) =>
                c.card_id === card.card_id
                  ? { ...c, quantity: Math.max(0, c.quantity - 1) }
                  : c
              )
            )
          }
          className="px-2 py-1 bg-red-500 text-white rounded"
        >
          ➖
        </button>
        <span className="w-6 text-center">{card.quantity}</span>
        <button
          onClick={() =>
            setCollection((prevCollection) =>
              prevCollection.map((c) =>
                c.card_id === card.card_id
                  ? { ...c, quantity: c.quantity + 1 }
                  : c
              )
            )
          }
          className="px-2 py-1 bg-green-500 text-white rounded"
        >
          ➕
        </button>
      </td>

      <td className="p-2">{card.name}</td>
      <td className="p-2">{card.type}</td>
      <td className="p-2">{card.color || "N/A"}</td>

      {/* Rarity with Symbol */}
      <td className="p-2 flex items-center">
        {card.rarity && rarityMap[card.rarity]?.image ? (
          <img
            src={rarityMap[card.rarity].image}
            alt={card.rarity}
            title={card.rarity}
            className="w-4 h-4 mr-1"
          />
        ) : (
          <span>{card.rarity || "Common"}</span>
        )}
      </td>

      {/* View Button */}
      <td className="p-2 text-center">
        <button
          onClick={() => setSelectedCard(card)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          🔍
        </button>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}
