import { useState, useEffect } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Expansion {
  id: string;
  name: string;
  // add any other fields if needed
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("dataManagement");

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
        const res = await fetch(BACKEND_URL + "/expansions/");
        if (res.ok) {
          const data = await res.json();
          // Flatten expansions if grouped by series
          const expArray: Expansion[] = [];
          const expansionsObj = data.expansions;
          for (const series in expansionsObj) {
            expansionsObj[series].forEach((exp: Expansion) => {
              expArray.push(exp);
            });
          }
          setExpansions(expArray);
          if (expArray.length > 0) {
            setSelectedExpansion(expArray[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching expansions:", error);
      }
    }
    fetchExpansions();
  }, []);

  // Handler: Update Expansions
  const handleUpdateExpansions = async () => {
    setLoadingUpdateExpansions(true);
    setUpdateExpansionsMessage("");
    try {
      const res = await fetch(BACKEND_URL + "/expansions/update/", {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        setUpdateExpansionsMessage("Error: " + errorData.detail);
      } else {
        const data = await res.json();
        setUpdateExpansionsMessage(
          data.message || "Expansions updated successfully!"
        );
      }
    } catch (err: any) {
      setUpdateExpansionsMessage("Error: " + err.message);
    }
    setLoadingUpdateExpansions(false);
  };

  // Handler: Fetch missing cards for the chosen expansion
  const handleUpdateMissingCards = async () => {
    if (!selectedExpansion) return;
    setLoadingUpdateCards(true);
    setUpdateCardsMessage("");
    try {
      const res = await fetch(
        BACKEND_URL + `/expansion/${selectedExpansion}/cards/update`,
        {
          method: "POST",
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        setUpdateCardsMessage("Error: " + errorData.detail);
      } else {
        const data = await res.json();
        setUpdateCardsMessage(
          data.message || "Cards updated successfully!"
        );
      }
    } catch (err: any) {
      setUpdateCardsMessage("Error: " + err.message);
    }
    setLoadingUpdateCards(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 
        If you have a Navbar and Footer already, keep them in your layout.
        Below is the main content area with your "Settings" page.
      */}
      <main className="flex-grow flex flex-col items-center justify-start text-center px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Settings</h1>

        {/* Tabs (Top navigation for categories) */}
        <div className="border-b border-gray-300 flex space-x-6 mb-6">
        <button
            className={`pb-2 ${
              activeTab === "settingsGeneral"
                ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("settingsGeneral")}
          >
            General
          </button>
          <button
            className={`pb-2 ${
              activeTab === "dataManagement"
                ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("dataManagement")}
          >
            Data Management
          </button>

          {/* 
            If you add more categories later, add more <button> elements here,
            e.g. "General", "Security", "Billing", etc.
          */}
        </div>

        {/* Content for the "Data Management" tab */}
        {activeTab === "dataManagement" && (
          <div className="w-full max-w-4xl">
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="min-w-full bg-white text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Option</th>
                    <th className="py-3 px-4 font-semibold">Action</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row: Update Expansions */}
                  <tr className="border-b">
                    <td className="py-4 px-4">Update Expansions</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={handleUpdateExpansions}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        disabled={loadingUpdateExpansions}
                      >
                        {loadingUpdateExpansions ? "Updating..." : "Update"}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      {updateExpansionsMessage && (
                        <span>{updateExpansionsMessage}</span>
                      )}
                    </td>
                  </tr>

                  {/* Row: Fetch Missing Cards */}
                  <tr>
                    <td className="py-4 px-4">Fetch Missing Cards</td>
                    <td className="py-4 px-4">
                      {/* Expansion Select */}
                      <div className="flex flex-col md:flex-row items-start md:items-center mb-2">
                        <label className="block md:mr-2 font-medium mb-2 md:mb-0">
                          Expansion:
                        </label>
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
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        disabled={loadingUpdateCards}
                      >
                        {loadingUpdateCards ? "Fetching..." : "Fetch Cards"}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      {updateCardsMessage && (
                        <span>{updateCardsMessage}</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer (if you have one) */}
      {/* <footer> ... </footer> */}
    </div>
  );
}
