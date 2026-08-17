import React from "react";
import { Bar } from "react-chartjs-2";

function Analytics() {
  const data = {
    labels: ["Burger", "Pizza", "Noodles", "Salad"],
    datasets: [
      {
        label: "Orders",
        data: [25, 40, 15, 20],
        backgroundColor: ["#0078d4", "#ff7e5f", "#feb47b", "#00c49f"],
      },
    ],
  };

  return (
    <div className="analytics">
      <h2 className="fw-bold text-primary mb-4">Sales Analytics</h2>
      <Bar data={data} />
    </div>
  );
}

export default Analytics;
