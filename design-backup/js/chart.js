document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("/candidates");
  const candidates = await response.json();

  const ctx = document.getElementById("resultsChart").getContext("2d");
  const chartData = {
    labels: candidates.map((c) => c.name),
    datasets: [
      {
        label: "Votes",
        data: candidates.map((c) => parseInt(c.voteCount)),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const resultsChart = new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
});
