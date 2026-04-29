(() => {
  const celebration = window.DJMarkyBoyCelebration;
  if (!celebration?.LAUNCH_AT) {
    return;
  }

  const {
    LAUNCH_AT,
    DEV_PANEL_PARAM,
    PREVIEW_MODE_KEY,
    ADMIN_TOKEN_KEY,
    PUBLIC_MODE_ENDPOINT,
    getMaintenanceConfig,
    isCelebrationPeriod,
    shouldShowLaunchEffects,
    runLaunchFlash
  } = celebration;

  const maintenanceView = document.getElementById("maintenance-view");
  const siteView = document.getElementById("site-view");
  const statusEl = document.getElementById("maintenance-status");
  const headingEl = document.getElementById("maintenance-heading");
  const detailEl = document.getElementById("maintenance-detail");
  const fireworksLayer = document.getElementById("fireworks-layer");
  const liveBanner = document.getElementById("live-banner");
  const devPanel = document.getElementById("maintenance-dev-panel");
  const devToggleButton = document.getElementById("maintenance-dev-toggle");
  const devContent = document.getElementById("maintenance-dev-content");
  const devForm = document.getElementById("maintenance-dev-form");
  const devTokenInput = document.getElementById("maintenance-admin-token");
  const devRefreshButton = document.getElementById("maintenance-dev-refresh");
  const devStatus = document.getElementById("maintenance-dev-status");
  const devClearButton = document.getElementById("maintenance-dev-clear");

  if (
    !maintenanceView ||
    !siteView ||
    !statusEl ||
    !headingEl ||
    !detailEl ||
    !devPanel ||
    !devToggleButton ||
    !devContent ||
    !devForm ||
    !devTokenInput ||
    !devRefreshButton ||
    !devStatus ||
    !devClearButton
  ) {
    return;
  }

  const runtimeState = {
    previewMode: getPreviewMode(),
    publicMode: null,
    publicUpdatedAt: null,
    launchFlashScheduled: false,
    maintenanceConfig: getMaintenanceConfig()
  };

  function setElementText(element, value) {
    if (typeof value === "string" && value.trim()) {
      element.textContent = value;
    }
  }

  function setDevStatus(message, isError = false) {
    devStatus.textContent = message;
    devStatus.classList.toggle("is-error", isError);
  }

  function getStoredValue(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function setStoredValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage failures in locked-down browsers.
    }
  }

  function removeStoredValue(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage failures in locked-down browsers.
    }
  }

  function isDevPanelEnabled() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(DEV_PANEL_PARAM)) {
      return false;
    }

    const value = params.get(DEV_PANEL_PARAM);
    return value !== "0" && value !== "false";
  }

  function setDevPanelCollapsed(collapsed) {
    devPanel.classList.toggle("is-collapsed", collapsed);
    devContent.hidden = collapsed;
    devToggleButton.setAttribute("aria-expanded", String(!collapsed));
    devToggleButton.textContent = collapsed ? "›" : "‹";
    devToggleButton.setAttribute(
      "aria-label",
      collapsed ? "Show maintenance controls" : "Hide maintenance controls"
    );
  }

  function isValidMode(value) {
    return value === "live" || value === "maintenance";
  }

  function getPreviewMode() {
    const stored = getStoredValue(PREVIEW_MODE_KEY);
    return stored === "live" || stored === "maintenance" ? stored : "auto";
  }

  function getEffectiveMode() {
    return runtimeState.previewMode === "auto"
      ? runtimeState.publicMode
      : runtimeState.previewMode;
  }

  function applyMaintenanceCopy() {
    runtimeState.maintenanceConfig = getMaintenanceConfig();
    setElementText(statusEl, runtimeState.maintenanceConfig.status);
    setElementText(headingEl, runtimeState.maintenanceConfig.heading);
    setElementText(detailEl, runtimeState.maintenanceConfig.detail);
  }

  function clearLaunchEffects() {
    if (liveBanner) {
      liveBanner.classList.remove("is-visible", "is-rolling-up");
      liveBanner.setAttribute("hidden", "");
    }

    if (fireworksLayer) {
      fireworksLayer.classList.remove("is-winding-down");
      fireworksLayer.setAttribute("hidden", "");
      fireworksLayer.innerHTML = "";
    }
  }

  function showMaintenanceView() {
    clearLaunchEffects();
    maintenanceView.classList.remove("launching", "shatter");
    maintenanceView.removeAttribute("hidden");
    siteView.setAttribute("hidden", "");
    document.body.classList.remove("is-live");
  }

  function showLiveSite(withIntro = false) {
    maintenanceView.setAttribute("hidden", "");
    siteView.removeAttribute("hidden");
    document.body.classList.add("is-live");

    if (withIntro) {
      siteView.classList.add("site-intro");
      window.setTimeout(() => {
        siteView.classList.remove("site-intro");
      }, 1100);
    } else {
      siteView.classList.remove("site-intro");
    }
  }

  function triggerLaunchFlashIfNeeded() {
    if (
      runtimeState.launchFlashScheduled ||
      !shouldShowLaunchEffects() ||
      new Date() < LAUNCH_AT ||
      getEffectiveMode() !== "live"
    ) {
      return;
    }

    runtimeState.launchFlashScheduled = true;
    window.setTimeout(runLaunchFlash, 300);
  }

  function updateView() {
    applyMaintenanceCopy();

    if (runtimeState.previewMode === "auto" && !runtimeState.publicMode) {
      maintenanceView.setAttribute("hidden", "");
      siteView.setAttribute("hidden", "");
      return;
    }

    if (getEffectiveMode() === "maintenance") {
      showMaintenanceView();
      return;
    }

    const isPreLaunch = new Date() < LAUNCH_AT;
    if (isPreLaunch) {
      setElementText(statusEl, "Website launch hold");
      setElementText(headingEl, "DJ Marky Boy is almost live.");
      setElementText(detailEl, "The full site is still being prepped. Thanks for hanging tight.");
      showMaintenanceView();
      return;
    }

    const withIntro = !document.body.classList.contains("is-live");
    showLiveSite(withIntro);
    triggerLaunchFlashIfNeeded();
  }

  function updatePreviewButtons() {
    if (devPanel.hasAttribute("hidden")) {
      return;
    }

    devPanel.querySelectorAll("[data-preview-mode]").forEach((button) => {
      const isActive = button.getAttribute("data-preview-mode") === runtimeState.previewMode;
      button.classList.toggle("is-active", isActive);
    });
  }

  function updatePublicButtons() {
    if (devPanel.hasAttribute("hidden")) {
      return;
    }

    devForm.querySelectorAll("[data-public-mode]").forEach((button) => {
      const isActive = button.getAttribute("data-public-mode") === runtimeState.publicMode;
      button.classList.toggle("is-active", isActive);
    });
  }

  function updateDevStatusSummary(message) {
    if (message) {
      setDevStatus(message);
      return;
    }

    const previewSummary =
      runtimeState.previewMode === "auto"
        ? "Preview follows the public website mode."
        : `Preview override is set to ${runtimeState.previewMode}.`;

    const publicSummary =
      runtimeState.publicUpdatedAt
        ? ` Public mode is ${runtimeState.publicMode} (updated ${runtimeState.publicUpdatedAt}).`
        : ` Public mode is ${runtimeState.publicMode}.`;

    setDevStatus(`${previewSummary}${publicSummary}`);
  }

  async function fetchPublicMode() {
    try {
      const response = await fetch(PUBLIC_MODE_ENDPOINT, {
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load site mode (${response.status})`);
      }

      const payload = await response.json();
      runtimeState.publicMode = isValidMode(payload.mode) ? payload.mode : "live";
      runtimeState.publicUpdatedAt = payload.updatedAt ?? null;
      updatePublicButtons();
      updateDevStatusSummary();
      updateView();
    } catch (error) {
      runtimeState.publicMode = "live";
      runtimeState.publicUpdatedAt = null;
      updatePublicButtons();
      updateView();
      updateDevStatusSummary(error.message);
    }
  }

  async function setPublicMode(mode) {
    if (!isValidMode(mode)) {
      setDevStatus("Choose a valid public mode before saving.", true);
      return;
    }

    const token = devTokenInput.value.trim();
    if (!token) {
      setDevStatus("Enter the admin token before changing the public website mode.", true);
      return;
    }

    setStoredValue(ADMIN_TOKEN_KEY, token);
    setDevStatus(`Saving public mode: ${mode}...`);

    try {
      const response = await fetch(PUBLIC_MODE_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ mode, token })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || `Failed to save site mode (${response.status})`);
      }

      runtimeState.publicMode = isValidMode(payload.mode) ? payload.mode : mode;
      runtimeState.publicUpdatedAt = payload.updatedAt ?? null;
      updatePublicButtons();
      updateDevStatusSummary(`Public website is now ${runtimeState.publicMode}.`);
      updateView();
    } catch (error) {
      setDevStatus(error.message, true);
    }
  }

  function initPreviewControls() {
    updatePreviewButtons();

    devPanel.querySelectorAll("[data-preview-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.getAttribute("data-preview-mode");
        if (mode !== "auto" && !isValidMode(mode)) {
          return;
        }

        runtimeState.previewMode = mode;
        if (mode === "auto") {
          removeStoredValue(PREVIEW_MODE_KEY);
        } else {
          setStoredValue(PREVIEW_MODE_KEY, mode);
        }

        updatePreviewButtons();
        updateDevStatusSummary();
        updateView();
      });
    });

    devClearButton.addEventListener("click", () => {
      runtimeState.previewMode = "auto";
      removeStoredValue(PREVIEW_MODE_KEY);
      updatePreviewButtons();
      updateDevStatusSummary();
      updateView();
    });
  }

  function initPublicControls() {
    const storedToken = getStoredValue(ADMIN_TOKEN_KEY);
    if (storedToken) {
      devTokenInput.value = storedToken;
    }

    let pendingMode = "maintenance";

    devForm.querySelectorAll("[data-public-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        pendingMode = button.getAttribute("data-public-mode") || "maintenance";
      });
    });

    devForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await setPublicMode(pendingMode);
    });

    devRefreshButton.addEventListener("click", async () => {
      setDevStatus("Refreshing public website mode...");
      await fetchPublicMode();
    });
  }

  function initDevPanel() {
    if (!isDevPanelEnabled()) {
      return;
    }

    devPanel.removeAttribute("hidden");
    setDevPanelCollapsed(false);

    devToggleButton.addEventListener("click", () => {
      setDevPanelCollapsed(!devPanel.classList.contains("is-collapsed"));
    });

    initPreviewControls();
    initPublicControls();
  }

  maintenanceView.setAttribute("hidden", "");
  siteView.setAttribute("hidden", "");
  initDevPanel();
  updateView();
  fetchPublicMode();

  if (isCelebrationPeriod() && new Date() >= LAUNCH_AT) {
    triggerLaunchFlashIfNeeded();
  }
})();
