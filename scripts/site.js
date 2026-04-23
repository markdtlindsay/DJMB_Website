(() => {
  const MODAL_CLOSE_DELAY_MS = 180;

  function setCopyrightYear() {
    const yearElement = document.getElementById("copyright-year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
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

  function escapeHtml(text) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return String(text).replace(/[&<>"']/g, (character) => entities[character]);
  }

  function formatGigDate(date) {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit"
    });

    return formatter.format(date).replace(/(\d{2})$/, "'$1");
  }

  function initGigModal() {
    const modal = document.getElementById("gigModal");
    const closeButton = document.getElementById("closeGigModal");
    const title = document.getElementById("gigModalTitle");
    const date = document.getElementById("gigModalDate");
    const meta = document.getElementById("gigModalMeta");
    const description = document.getElementById("gigModalDescription");
    let isClosing = false;

    if (!modal || !closeButton || !title || !date || !meta || !description) {
      return { open: () => {} };
    }

    function open(eventDetails) {
      if (isClosing) {
        modal.classList.remove("is-closing");
        isClosing = false;
      }

      title.textContent = eventDetails.title || "Gig details";
      date.textContent = eventDetails.dateLabel || "";

      const metaParts = [eventDetails.timeLabel, eventDetails.venue].filter(Boolean);
      if (metaParts.length) {
        meta.hidden = false;
        meta.innerHTML = metaParts.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
      } else {
        meta.hidden = true;
        meta.innerHTML = "";
      }

      description.innerHTML = eventDetails.description
        ? `<p>${linkifyText(escapeHtml(eventDetails.description)).replace(/\n/g, "<br>")}</p>`
        : "<p>No extra details for this gig yet.</p>";

      modal.classList.add("is-open");
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
    }

    function close() {
      if (isClosing || !modal.classList.contains("is-open")) {
        return;
      }

      isClosing = true;
      modal.classList.remove("is-open");
      modal.classList.add("is-closing");

      window.setTimeout(() => {
        modal.classList.remove("is-closing");
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        isClosing = false;
      }, MODAL_CLOSE_DELAY_MS);
    }

    closeButton.addEventListener("click", close);

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        close();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
      }
    });

    return { open };
  }

  async function loadGigs(gigModal) {
    const list = document.getElementById("gigs-list");

    if (!list) return;

    try {
      const res = await fetch("/.netlify/functions/gigs?nocache=" + Date.now());
      const data = await res.json();
      const events = Array.isArray(data?.events) ? data.events : [];

      list.innerHTML = "";
      const timeFormatter = new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit"
      });

      events.forEach((event, index) => {
        const date = new Date(event.start);
        const dateLabel = formatGigDate(date);
        const timeLabel = event.hasTime ? timeFormatter.format(date) : "";
        const title = event.title || "Gig";
        const venue = event.venue || "";
        const description = event.description || "";

        const card = document.createElement("button");
        card.className = "gig-card is-entering";
        card.type = "button";
        card.style.setProperty("--gig-delay", `${index * 90}ms`);
        card.setAttribute("aria-label", `View details for ${title} on ${dateLabel}${timeLabel ? ` at ${timeLabel}` : ""}`);

        card.innerHTML = `
          <span class="gig-row">
            <span class="gig-poster-date">
              <span class="gig-poster-day">${escapeHtml(dateLabel)}</span>
              ${timeLabel ? `<span class="gig-poster-time">${timeLabel}</span>` : ""}
            </span>

            <span class="gig-row-body">
              <span class="gig-title">${escapeHtml(title)}</span>
              <span class="gig-row-hint">More details</span>
            </span>
          </span>
        `;

        const openGigModal = () => {
          gigModal.open({
            title,
            dateLabel,
            timeLabel,
            venue,
            description
          });
        };

        card.addEventListener("pointerup", (pointerEvent) => {
          if (pointerEvent.pointerType === "mouse" && pointerEvent.button !== 0) {
            return;
          }

          openGigModal();
        });

        card.addEventListener("click", (clickEvent) => {
          // Some mobile browsers can require an initial focus tap before click.
          // Keeping a click handler alongside pointerup preserves compatibility.
          if (clickEvent.detail === 0) {
            openGigModal();
          }
        });

        list.appendChild(card);
      });
    } catch (err) {
      list.innerHTML = "";
    }
  }

  function initModal({ triggerId, modalId, closeId }) {
    const trigger = document.getElementById(triggerId);
    const modal = document.getElementById(modalId);
    const closeButton = document.getElementById(closeId);
    let isClosing = false;

    if (!trigger || !modal || !closeButton) {
      return;
    }

    function openModal() {
      if (isClosing) {
        modal.classList.remove("is-closing");
        isClosing = false;
      }

      modal.classList.add("is-open");
      modal.style.display = "flex";
    }

    function closeModalPanel() {
      if (isClosing || !modal.classList.contains("is-open")) {
        return;
      }

      isClosing = true;
      modal.classList.remove("is-open");
      modal.classList.add("is-closing");

      window.setTimeout(() => {
        modal.classList.remove("is-closing");
        modal.style.display = "none";
        isClosing = false;
      }, MODAL_CLOSE_DELAY_MS);
    }

    trigger.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModalPanel);

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModalPanel();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModalPanel();
      }
    });
  }

  function initModals() {
    initModal({
      triggerId: "about-open-button",
      modalId: "aboutModal",
      closeId: "closeModal"
    });

    initModal({
      triggerId: "socials-open-button",
      modalId: "socialsModal",
      closeId: "closeSocialsModal"
    });
  }

  function initSite() {
    const gigModal = initGigModal();

    setCopyrightYear();
    loadGigs(gigModal);
    initModals();

    window.DJMarkyBoyAmbient?.init();
  }
  
  initSite();
})();
