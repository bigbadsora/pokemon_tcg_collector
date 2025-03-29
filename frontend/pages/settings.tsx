import { useState, useEffect } from "react";

interface Expansion {
  id: string;
  name: string;
  // add any other fields if needed
}

export default function Settings() {
  const [loadingUpdateExpansions, setLoadingUpdateExpansions] = useState(false);
  const [updateExpansionsMessage, setUpdateExpansionsMessage] = useState("");
  const [loadingUpdateCards, setLoadingUpdateCards] = useState(false);
  const [updateCardsMessage, setUpdateCardsMessage] = useState("");
  const [expansions, setExpansions] = useState<Expansion[]>([]);
  const [selectedExpansion, setSelectedExpansion] = useState("");

  // Fetch expansions for the dropdown on component mount
  useEffect(() => {
    async function fetchExpansions() {
      try {
        const res = await fetch("http://localhost:8000/expansions/");
        if (res.ok) {
          const data = await res.json();
          // Assuming the response groups expansions by series, flatten them into a single array.
          const expArray: Expansion[] = [];
          const expansionsObj = data.expansions;
          for (const series in expansionsObj) {
            expansionsObj[series].forEach((exp: Expansion) => {
              expArray.push(exp);
            });
          }
          setExpansions(expArray);
          if(expArray.length > 0) {
              setSelectedExpansion(expArray[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching expansions:", error);
      }
    }
    fetchExpansions();
  }, []);

  // Existing Update Expansions functionality (if you want to keep it)
  const handleUpdateExpansions = async () => {
    setLoadingUpdateExpansions(true);
    setUpdateExpansionsMessage("");
    try {
      const res = await fetch("http://localhost:8000/expansions/update/", {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        setUpdateExpansionsMessage("Error: " + errorData.detail);
      } else {
        const data = await res.json();
        setUpdateExpansionsMessage(data.message || "Expansions updated successfully!");
      }
    } catch (err: any) {
      setUpdateExpansionsMessage("Error: " + err.message);
    }
    setLoadingUpdateExpansions(false);
  };

  // New handler for fetching missing cards for a chosen expansion
  const handleUpdateMissingCards = async () => {
    if (!selectedExpansion) return;
    setLoadingUpdateCards(true);
    setUpdateCardsMessage("");
    try {
      const res = await fetch(`http://localhost:8000/expansion/${selectedExpansion}/cards/update`, {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        setUpdateCardsMessage("Error: " + errorData.detail);
      } else {
        const data = await res.json();
        setUpdateCardsMessage(data.message || "Cards updated successfully!");
      }
    } catch (err: any) {
      setUpdateCardsMessage("Error: " + err.message);
    }
    setLoadingUpdateCards(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6">
      <h1 className="text-4xl font-bold mb-4">Settings</h1>
      
      {/* Update Expansions Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">Update Expansions</h2>
        <button
          onClick={handleUpdateExpansions}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition"
          disabled={loadingUpdateExpansions}
        >
          {loadingUpdateExpansions ? "Updating..." : "Update Expansions"}
        </button>
        {updateExpansionsMessage && <p className="mt-4 text-lg">{updateExpansionsMessage}</p>}
      </div>

      {/* Fetch Missing Cards for Selected Expansion Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">Fetch Missing Cards for Expansion</h2>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Expansion:</label>
          <select
            value={selectedExpansion}
            onChange={(e) => setSelectedExpansion(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2"
          >
            {expansions.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.name} ({exp.id})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleUpdateMissingCards}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
          disabled={loadingUpdateCards}
        >
          {loadingUpdateCards ? "Fetching..." : "Fetch Missing Cards"}
        </button>
        {updateCardsMessage && <p className="mt-4 text-lg">{updateCardsMessage}</p>}
      </div>
    </div>
  );
}
