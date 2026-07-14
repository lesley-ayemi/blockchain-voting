document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("/candidates");
  const candidates = await response.json();

  const ctx = document.getElementById("resultsChart").getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, "rgba(139, 92, 246, 0.9)");
  gradient.addColorStop(1, "rgba(34, 211, 238, 0.6)");

  const chartData = {
    labels: candidates.map((c) => c.name),
    datasets: [
      {
        label: "Votes",
        data: candidates.map((c) => parseInt(c.voteCount)),
        backgroundColor: gradient,
        borderRadius: 8,
        maxBarThickness: 56,
      },
    ],
  };

  const resultsChart = new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1b1f2a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          titleColor: "#eef0f5",
          bodyColor: "#eef0f5",
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#9aa0b1" },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
        x: {
          ticks: { color: "#9aa0b1" },
          grid: { display: false },
        },
      },
    },
  });
});
