(() => {
  // Celebration dependencies
  const celebration = window.DJMarkyBoyCelebration;
  if (!celebration?.LAUNCH_AT) {
    return;
  }

  const launchAt = celebration.LAUNCH_AT;
  const shouldShowLaunchEffects = celebration.shouldShowLaunchEffects;
  const runLaunchFlash = celebration.runLaunchFlash;
  const startTestCountdown = celebration.startTestCountdown;
  const clearTestCountdown = celebration.clearTestCountdown;
  const devPanelParam = celebration.DEV_PANEL_PARAM ?? "countdownDev";

  // Cached DOM elements
  const countdownView = document.getElementById("countdown-view");
  const siteView = document.getElementById("site-view");
  const daysEl = document.getElementById("countdown-days");
  const hoursEl = document.getElementById("countdown-hours");
  const minutesEl = document.getElementById("countdown-minutes");
  const secondsEl = document.getElementById("countdown-seconds");
  const daysBox = daysEl?.closest(".countdown-item");
  const hoursBox = hoursEl?.closest(".countdown-item");
  const minutesBox = minutesEl?.closest(".countdown-item");
  const devPanel = document.getElementById("countdown-dev-panel");
  const devToggleButton = document.getElementById("countdown-dev-toggle");
  const devContent = document.getElementById("countdown-dev-content");
  const devForm = document.getElementById("countdown-dev-form");
  const devInput = document.getElementById("countdown-dev-seconds");
  const devClearButton = document.getElementById("countdown-dev-clear");

  if (!countdownView || !siteView || !daysEl || !hoursEl || !minutesEl || !secondsEl) {
    return;
  }

  // Shared helpers
  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function toggleHidden(element, hidden) {
    if (element) {
      element.classList.toggle("is-hidden", hidden);
    }
  }

  // Countdown dev panel
  function isDevPanelEnabled() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(devPanelParam)) {
      return false;
    }

    const value = params.get(devPanelParam);
    return value !== "0" && value !== "false";
  }

  function parsePositiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function setDevPanelCollapsed(collapsed) {
    if (!devPanel || !devToggleButton || !devContent) {
      return;
    }

    devPanel.classList.toggle("is-collapsed", collapsed);
    devContent.hidden = collapsed;
    devToggleButton.setAttribute("aria-expanded", String(!collapsed));
    devToggleButton.textContent = collapsed ? "Show" : "Hide";
  }

  function initDevPanel() {
    if (!devPanel || !isDevPanelEnabled()) {
      return;
    }

    devPanel.removeAttribute("hidden");
    setDevPanelCollapsed(false);

    if (devToggleButton) {
      devToggleButton.addEventListener("click", () => {
        setDevPanelCollapsed(!devPanel.classList.contains("is-collapsed"));
      });
    }

    devPanel.querySelectorAll("[data-countdown-seconds]").forEach((button) => {
      button.addEventListener("click", () => {
        const value = parsePositiveNumber(button.getAttribute("data-countdown-seconds"));
        if (value) {
          startTestCountdown(value);
        }
      });
    });

    if (devForm && devInput) {
      devForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const value = parsePositiveNumber(devInput.value);
        if (value) {
          startTestCountdown(value);
        }
      });
    }

    if (devClearButton) {
      devClearButton.addEventListener("click", clearTestCountdown);
    }
  }

  // Countdown display
  function updateCountdownDisplay(diff) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const isFinalMinute = diff <= 60000;

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);

    countdownView.classList.toggle("final-minute", isFinalMinute);
    toggleHidden(daysBox, days <= 0);
    toggleHidden(hoursBox, days <= 0 && hours <= 0);
    toggleHidden(minutesBox, days <= 0 && hours <= 0 && minutes <= 0);
  }

  // Launch transition
  function revealSite() {
    if (shouldShowLaunchEffects()) {
      runLaunchFlash();
    }

    countdownView.setAttribute("hidden", "");
    siteView.removeAttribute("hidden");
    document.body.classList.add("is-live");

    siteView.classList.add("site-intro");
    setTimeout(() => {
      siteView.classList.remove("site-intro");
    }, 1100);
  }

  function finishCountdown() {
    clearInterval(countdownInterval);

    if (countdownView.hasAttribute("hidden")) {
      revealSite();
      return;
    }

    countdownView.classList.add("launching", "shatter");
    setTimeout(revealSite, 900);
  }

  // Countdown lifecycle
  function updateCountdown() {
    const diff = launchAt - new Date();

    if (diff > 0) {
      countdownView.removeAttribute("hidden");
      siteView.setAttribute("hidden", "");
      updateCountdownDisplay(diff);
      return;
    }

    finishCountdown();
  }

  // Initialization
  const countdownInterval = setInterval(updateCountdown, 1000);

  countdownView.setAttribute("hidden", "");
  siteView.setAttribute("hidden", "");
  initDevPanel();
  updateCountdown();

  if (shouldShowLaunchEffects() && new Date() >= launchAt) {
    setTimeout(runLaunchFlash, 300);
  }
})();
