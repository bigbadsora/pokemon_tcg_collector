// pages/index.tsx
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const TotalCardsWidget: React.FC = () => {
  const [totalCards, setTotalCards] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/widgets/totalCards')
      .then((res) => res.json())
      .then((data) => setTotalCards(data.totalCards))
      .catch((err) => console.error('Error fetching total cards:', err));
  }, []);

  return (
    <div className="bg-white shadow rounded p-4 m-2 text-center">
      <h3 className="text-lg font-bold mb-2">Total Cards</h3>
      {totalCards !== null ? <p className="text-2xl">{totalCards}</p> : <p>Loading...</p>}
    </div>
  );
};

const TotalExpansionsWidget: React.FC = () => {
  const [totalExpansions, setTotalExpansions] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/widgets/totalExpansions')
      .then((res) => res.json())
      .then((data) => setTotalExpansions(data.totalExpansions))
      .catch((err) => console.error('Error fetching total expansions:', err));
  }, []);

  return (
    <div className="bg-white shadow rounded p-4 m-2 text-center">
      <h3 className="text-lg font-bold mb-2">Total Expansions</h3>
      {totalExpansions !== null ? <p className="text-2xl">{totalExpansions}</p> : <p>Loading...</p>}
    </div>
  );
};

const CardsByExpansionWidget: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/widgets/cardsByExpansion')
      .then((res) => res.json())
      .then((data) => {
        // Assume data is an array like:
        // [{ expansionName: string, cardCount: number }, ...]
        const labels = data.map((item: { expansionName: string; cardCount: number }) => item.expansionName);
        const counts = data.map((item: { expansionName: string; cardCount: number }) => item.cardCount);
        setChartData({
          labels,
          datasets: [
            {
              label: 'Cards by Expansion',
              data: counts,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((err) => console.error('Error fetching cards by expansion:', err));
  }, []);

  return (
    <div className="bg-white shadow rounded p-4 m-2 text-center">
      <h3 className="text-lg font-bold mb-2">Cards by Expansion</h3>
      {chartData ? <Pie data={chartData} /> : <p>Loading chart...</p>}
    </div>
  );
};

const WidgetDashboard: React.FC = () => {
  const defaultWidgets = [
    { id: 'totalCards', name: 'Total Cards', component: <TotalCardsWidget key="totalCards" /> },
    { id: 'totalExpansions', name: 'Total Expansions', component: <TotalExpansionsWidget key="totalExpansions" /> },
    { id: 'cardsByExpansion', name: 'Cards by Expansion', component: <CardsByExpansionWidget key="cardsByExpansion" /> },
  ];

  const [widgets] = useState(defaultWidgets);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-center my-4">Dashboard</h2>
      <div className="flex flex-wrap justify-center">
        {widgets.map((widget) => (
          <div key={widget.id} className="w-full md:w-1/3">
            {widget.component}
          </div>
        ))}
      </div>
    </div>
  );
};

const IndexPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="py-4 bg-blue-600 text-white text-center">
        <h1 className="text-3xl font-bold">Pokemon TCG Collector</h1>
      </header>
      <main className="py-8">
        <WidgetDashboard />
      </main>
    </div>
  );
};

export default IndexPage;
