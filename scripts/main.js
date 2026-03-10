// Launch date and time (UK time)
const launchDate = new Date("2026-04-01T18:00:00");

const countdownView = document.getElementById("countdown-view");
const siteView = document.getElementById("site-view");
const countdownTimer = document.getElementById("countdown-timer");

function updateCountdown() {
  const now = new Date();
  const diff = launchDate - now;

  if (diff <= 0) {
    countdownView.style.display = "none";
    siteView.hidden = false;
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownTimer.textContent =
    `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Set copyright year automatically
document.getElementById("copyright-year").textContent =
  new Date().getFullYear();