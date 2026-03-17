// Launch date and time (UK time)
const launchDate = new Date("2026-04-26T19:04:00");

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

  const pad = (num) => String(num).padStart(2, "0");

document.getElementById("countdown-days").textContent = pad(days);
document.getElementById("countdown-hours").textContent = pad(hours);
document.getElementById("countdown-minutes").textContent = pad(minutes);
document.getElementById("countdown-seconds").textContent = pad(seconds);
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

    list.innerHTML = "";

    const formatter = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    data.events.forEach(event => {
      console.log("Gig description:", event.description);
      const date = new Date(event.start);

      const card = document.createElement("div");
      card.className = "gig-card";

      card.innerHTML = `
        <div class="gig-poster">

        <div class="gig-poster-date">
          ${formatter.format(date)}
        </div>

        <div class="gig-poster-body">
          <div class="gig-title">${event.title}</div>
          <div class="gig-venue">${event.venue || ""}</div>
          <div class="gig-description">${linkifyText(event.description || "")}</div>
        </div>

      </div>
    `;

      list.appendChild(card);

    });
  } catch (err) {
    list.innerHTML = "";
  }
}

function linkifyText(text) {
  if (!text) return "";

  const regex = /(https?:\/\/[^\s"<]+)(?:\s*\[([^\]]+)\])?/g;

  return text.replace(regex, (match, url, label) => {
    const linkText = label || url;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  });
}

loadGigs();

const aboutButton = document.getElementById("about-open-button");
const aboutModal = document.getElementById("aboutModal");
const closeModal = document.getElementById("closeModal");

if (aboutButton && aboutModal && closeModal) {

  aboutButton.addEventListener("click", () => {
    aboutModal.style.display = "flex";
  });

  closeModal.addEventListener("click", () => {
    aboutModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === aboutModal) {
      aboutModal.style.display = "none";
    }
  });

}