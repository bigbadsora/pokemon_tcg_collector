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
  evolves_from: string | null;
  number: string;
  hp: string | null;
  types: string | null;
  supertype: string;
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

  // New state for the view mode toggle (Table or Binder)
  const [viewMode, setViewMode] = useState("Table");
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "Table" ? "Binder" : "Table"));
  };

  useEffect(() => {
    fetch("http://localhost:8000/expansions/")
      .then((res) => res.json())
      .then((data) => {
        const expansionList = Object.values(
          data.expansions
        ).flat() as Expansion[];
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

  const updateQuantity = async (cardId: string, change: number) => {
    await fetch(
      `http://localhost:8000/collection/update/?card_id=${cardId}&change=${change}`,
      {
        method: "POST",
      }
    );

    setCollection((prevCollection) =>
      prevCollection.map((c) =>
        c.card_id === cardId
          ? { ...c, quantity: Math.max(0, c.quantity + change) }
          : c
      )
    );
  };

  return (
    <div className="p-4">
      {/* Header with "My Collection" and Toggle Switch */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Collection</h1>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium mb-1">{viewMode}</span>
          <label
            htmlFor="toggleViewMode"
            className="inline-flex relative items-center cursor-pointer"
          >
            <input
              type="checkbox"
              id="toggleViewMode"
              className="sr-only peer"
              onChange={toggleViewMode}
              checked={viewMode === "Binder"}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-300"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>

      {/* Top Bar with Expansion Dropdown & Stats */}
      <div className="flex justify-between mb-4">
        {/* Left Side: Stats Box */}
        {stats && (
          <div className="flex flex-col bg-gray-100 p-4 rounded-lg shadow min-h-[80px] border border-gray-300 mr-2 self-stretch">
            <p className="font-bold mb-2">Total: {stats.total}</p>
            <div className="flex space-x-3">
              {Object.entries(stats.rarities).map(([rarity, count]) => {
                const rarityData = rarityMap[rarity] || { name: rarity };
                return (
                  <div
                    key={rarity}
                    className="flex items-center space-x-1 text-sm"
                  >
                    {rarityData.image ? (
                      <img
                        src={rarityData.image}
                        alt={rarityData.name}
                        title={rarityData.name}
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

        {/* Right Side: Expansion Dropdown */}
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
              <td className="p-2 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <button
                    onClick={() => updateQuantity(card.card_id, -1)}
                    className="text-sm px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{card.quantity}</span>
                  <button
                    onClick={() => updateQuantity(card.card_id, 1)}
                    className="text-sm px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="p-2">{card.name}</td>
              <td className="p-2">{card.type}</td>
              <td className="p-2">{card.color || "N/A"}</td>
              <td className="p-2 align-middle">
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
              <td className="p-2 text-center">
                <button
                  onClick={() => setSelectedCard(card)}
                  className="px-3 py-1 bg-blue-500 text-white rounded cursor-pointer"
                >
                  🔍
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for card details */}
      <Transition show={!!selectedCard} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedCard(null)}
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
              >
                ✕
              </button>
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
              {selectedCard?.evolves_from && (
                <p className="mt-1">
                  <strong>Evolves from:</strong> {selectedCard.evolves_from}
                </p>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
