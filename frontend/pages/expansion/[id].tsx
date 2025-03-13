import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface Card {
  id: string;
  name: string;
  number: string;
  rarity: string | null;
  supertype: string;
  subtype: string | null;
  hp: string | null;
  types: string | null;
  evolves_from: string | null;
  image_url: string;
}

export default function ExpansionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [cards, setCards] = useState<Card[]>([]);
  const [expansionName, setExpansionName] = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/expansion/${id}/cards`)
        .then((res) => res.json())
        .then((data) => {
          setCards(data.cards);
          if (data.cards.length > 0) {
            setExpansionName(data.cards[0].expansion_id); // Get expansion name from first card
          }
        })
        .catch((error) => console.error("Error fetching cards:", error));
    }
  }, [id]);

  return (
    <div className="p-4 relative">
      <h1 className="text-2xl font-bold mb-4">{expansionName} Expansion</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="border p-3 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition"
            onClick={() => setSelectedCard(card)}
          >
            <img src={card.image_url} alt={card.name} className="w-full h-48 object-contain" />
            <h2 className="text-lg font-semibold mt-2">{card.name}</h2>
            <p className="text-sm text-gray-500">
              #{card.number} - {card.rarity || "Common"}
            </p>
          </div>
        ))}
      </div>

      {/* Modal for card details */}
      <Transition show={!!selectedCard} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedCard(null)}>
          {/* This is the dimmed background effect */}
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

              {/* Card Image (3x size) */}
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
