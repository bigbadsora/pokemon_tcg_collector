import { useEffect, useState } from "react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Expansion {
  id: string;
  name: string;
  release_date: string;
  symbol_url: string;
  logo_url: string;
}

interface ExpansionsGrouped {
  [series: string]: Expansion[];
}

export default function Expansions() {
  const [expansions, setExpansions] = useState<ExpansionsGrouped>({});

  useEffect(() => {
    fetch(BACKEND_URL + "/expansions/")
      .then((res) => res.json())
      .then((data) => {
        if (data.expansions) {
          setExpansions(data.expansions);
        } else {
          console.error("API response missing expansions key:", data);
        }
      })
      .catch((error) => console.error("Error fetching expansions:", error));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pokémon TCG Expansions</h1>

      {Object.entries(expansions).map(([series, expansionsList]) => (
        <div key={series} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{series}</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(expansionsList || []).map((expansion) => (
              <Link
                key={expansion.id}
                href={`/expansion/${expansion.id}`}
                className="border p-3 rounded-lg shadow-md hover:bg-gray-100 transition"
              >
                <img
                  src={expansion.logo_url}
                  alt={expansion.name}
                  className="w-full h-20 object-contain"
                />
                <h3 className="text-lg font-semibold mt-2">{expansion.name}</h3>
                <p className="text-xs text-gray-500">
                  Released: {expansion.release_date}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
