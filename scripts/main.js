// Launch date and time (UK time)
const launchDate = new Date("2026-03-10T17:30:00");

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

// Load gigs from gigs.json
  async function loadGigs() {

const list = document.getElementById("gigs-list");

if (!list) return;

try {
  const res = await fetch("/.netlify/functions/gigs?nocache=" + Date.now());
const data = await res.json();

if (!data.events || data.events.length === 0) {
  list.innerHTML = "<li>No upcoming gigs</li>";
  return;
}

list.innerHTML = "";

const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

data.events.forEach(event => {

  const date = new Date(event.start);

  const li = document.createElement("li");
  li.textContent = formatter.format(date) + " – " + event.title;

  list.appendChild(li);

});
} catch (err) {
list.innerHTML = "<li>Unable to load gigs</li>";
}

}

loadGigs();