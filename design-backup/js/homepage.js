document.addEventListener("DOMContentLoaded", async () => {
  // Load candidates
  const response = await fetch("/candidates");
  const candidates = await response.json();
  const accountAddressElement = document
    .getElementById("accountAddress")
    .querySelector("span");
  if (typeof window.ethereum !== "undefined") {
    // Request account information from Metamask
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const voterAddress = accounts[0];
      localStorage.setItem("voterAddress", voterAddress);
      accountAddressElement.textContent = voterAddress;
    } catch (error) {
      console.error("User denied account access or Metamask is locked.");
      return;
    }
  } else {
    alert("Metamask not found. Please install it.");
    return;
  }

  const candidatesList = document.getElementById("candidatesList");
  candidates.forEach((candidate, index) => {
    const candidateElement = document.createElement("div");
    candidateElement.className = "candidate";
    candidateElement.innerHTML = `
            <p>${candidate.name} - Votes: ${candidate.voteCount}</p>
            <button onclick="vote(${index})">Vote Now</button>
        `;
    candidatesList.appendChild(candidateElement);
  });

  // Tab navigation
  document.querySelectorAll(".nav-tabs button").forEach((button) => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".tab-content").forEach((tab) => {
        tab.classList.remove("active");
      });
      document
        .getElementById(this.getAttribute("data-tab"))
        .classList.add("active");
    });
  });
});

async function vote(candidateId) {
  if (typeof window.ethereum !== "undefined") {
    try {
      // Request account access if needed
      const account = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const selectedAccount = account[0]; // This will open Metamask for user to select account
      localStorage.setItem("voterAddress", selectedAccount);
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const voterAddress = accounts[0];

      // Send the vote to the server
      const response = await fetch("/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, voterAddress }),
      });

      if (response.ok) {
        showAlert("Vote cast successfully!");
        window.location.reload();
      } else {
        showAlert("User denied account access.Has Voted Before");
      }
    } catch (error) {
      showAlert("User denied account access.");
    }
  } else {
    showAlert("MetaMask is not installed. Please install it to vote.");
  }
}

function showAlert(message) {
  const alertBox = document.getElementById("alertMessage");
  alertBox.textContent = message;
  alertBox.classList.add("show");
  setTimeout(() => alertBox.classList.remove("show"), 3000);
}
