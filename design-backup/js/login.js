document.getElementById("loginButton").onclick = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      localStorage.setItem("voterAddress", accounts[0]);
      window.location.href = "homepage.html";
    } catch (error) {
      showAlert("User rejected the request.");
    }
  } else {
    showAlert("Metamask not found. Please install it.");
  }
};

function showAlert(message) {
  const alertBox = document.getElementById("alertMessage");
  alertBox.textContent = message;
  alertBox.classList.add("show");
  setTimeout(() => alertBox.classList.remove("show"), 3000);
}
