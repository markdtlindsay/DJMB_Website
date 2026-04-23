(() => {
  // Launch configuration
  const CELEBRATION_WEEKS = 4;
  const DEFAULT_LAUNCH_AT = new Date("2026-04-26T19:04:00");
  const TEST_OFFSET_PARAM = "countdownTest";
  const TEST_LAUNCH_AT_PARAM = "launchAt";
  const DEV_PANEL_PARAM = "countdownDev";

  // Query parsing
  function getQueryParams() {
    return new URLSearchParams(window.location.search);
  }

  function getQueryLaunchOverride() {
    const params = getQueryParams();
    const launchAtValue = params.get(TEST_LAUNCH_AT_PARAM);

    if (launchAtValue) {
      const explicitDate = new Date(launchAtValue);
      if (!Number.isNaN(explicitDate.getTime())) {
        return explicitDate;
      }
    }

    const countdownTestValue = params.get(TEST_OFFSET_PARAM);
    if (!countdownTestValue) {
      return null;
    }

    const seconds = Number(countdownTestValue);
    if (!Number.isFinite(seconds)) {
      return null;
    }

    return new Date(Date.now() + seconds * 1000);
  }

  // Celebration timing
  const LAUNCH_AT = getQueryLaunchOverride() ?? DEFAULT_LAUNCH_AT;
  const CELEBRATION_END = new Date(
    LAUNCH_AT.getTime() + CELEBRATION_WEEKS * 7 * 24 * 60 * 60 * 1000
  );

  function isCelebrationPeriod(now = new Date()) {
    return now >= LAUNCH_AT && now < CELEBRATION_END;
  }

  function shouldShowLaunchEffects(now = new Date()) {
    return isCelebrationPeriod(now);
  }

  // Countdown test helpers
  function buildTestUrl(seconds = 20) {
    const url = new URL(window.location.href);
    url.searchParams.set(TEST_OFFSET_PARAM, String(seconds));
    url.searchParams.delete(TEST_LAUNCH_AT_PARAM);
    url.searchParams.set(DEV_PANEL_PARAM, "1");
    return url.toString();
  }

  function startTestCountdown(seconds = 20) {
    window.location.href = buildTestUrl(seconds);
  }

  function clearTestCountdown() {
    const url = new URL(window.location.href);
    url.searchParams.delete(TEST_OFFSET_PARAM);
    url.searchParams.delete(TEST_LAUNCH_AT_PARAM);
    window.location.href = url.toString();
  }

  // Launch visual effect
  function runLaunchFlash() {
    const layer = document.getElementById("fireworks-layer");
    const banner = document.getElementById("live-banner");
    if (!layer) return;

    const celebrationDuration = 30000;
    const confettiWaveInterval = 2200;
    const burstWaveInterval = 3600;
    const windDownDuration = 1800;
    const activeDuration = celebrationDuration - windDownDuration;

    layer.innerHTML = "";
    layer.removeAttribute("hidden");
    layer.classList.remove("is-winding-down");
    banner?.removeAttribute("hidden");

    function spawnFlashWave() {
      const flashCount = 3;
      for (let i = 0; i < flashCount; i++) {
        const flash = document.createElement("div");
        flash.className = "launch-flash";
        flash.style.animationDelay = `${i * 180}ms`;
        layer.appendChild(flash);
      }
    }

    function spawnBurstWave() {
      const burstConfigs = [
        { x: 50, y: 48, count: 42, spread: [170, 290], delayOffset: 0 },
        { x: 28, y: 36, count: 26, spread: [120, 220], delayOffset: 160 },
        { x: 72, y: 34, count: 26, spread: [120, 220], delayOffset: 240 }
      ];

      burstConfigs.forEach((burst) => {
        for (let i = 0; i < burst.count; i++) {
          const spark = document.createElement("div");
          spark.className = "launch-spark";

          const angle = (Math.PI * 2 * i) / burst.count;
          const minDistance = burst.spread[0];
          const maxDistance = burst.spread[1];
          const distance = minDistance + Math.random() * (maxDistance - minDistance);

          spark.style.left = `${burst.x}%`;
          spark.style.top = `${burst.y}%`;
          spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
          spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
          spark.style.animationDelay = `${burst.delayOffset + i * 16}ms`;

          layer.appendChild(spark);
        }
      });
    }

    function spawnConfettiWave(multiplier = 1) {
      const confettiCount = Math.round(90 * multiplier);
      for (let i = 0; i < confettiCount; i++) {
        const piece = document.createElement("div");
        piece.className = "launch-confetti";

        const startX = Math.random() * 100;
        const drift = -120 + Math.random() * 240;
        const duration = 3200 + Math.random() * 3600;
        const delay = Math.random() * 1200;
        const rotation = -540 + Math.random() * 1080;
        const width = 8 + Math.random() * 10;
        const height = 14 + Math.random() * 16;

        piece.style.left = `${startX}%`;
        piece.style.width = `${width}px`;
        piece.style.height = `${height}px`;
        piece.style.animationDelay = `${delay}ms`;
        piece.style.animationDuration = `${duration}ms`;
        piece.style.setProperty("--confetti-drift", `${drift}px`);
        piece.style.setProperty("--confetti-rotate", `${rotation}deg`);

        layer.appendChild(piece);
      }
    }

    spawnFlashWave();
    spawnBurstWave();
    spawnConfettiWave(1.6);

    if (banner) {
      banner.classList.remove("is-rolling-up");
      banner.classList.remove("is-visible");
      void banner.offsetWidth;
      banner.classList.add("is-visible");
    }

    const flashTimeouts = [
      window.setTimeout(spawnFlashWave, 4200),
      window.setTimeout(spawnFlashWave, 9800),
      window.setTimeout(spawnFlashWave, 16200),
      window.setTimeout(spawnFlashWave, 23600)
    ];

    const burstInterval = window.setInterval(spawnBurstWave, burstWaveInterval);
    const confettiInterval = window.setInterval(() => {
      spawnConfettiWave(1);
    }, confettiWaveInterval);

    window.setTimeout(() => {
      flashTimeouts.forEach(window.clearTimeout);
      if (banner) {
        banner.classList.remove("is-visible");
        banner.classList.add("is-rolling-up");
      }
      layer.classList.add("is-winding-down");
      window.clearInterval(burstInterval);
      window.clearInterval(confettiInterval);
    }, activeDuration);

    window.setTimeout(() => {
      if (banner) {
        banner.classList.remove("is-rolling-up");
        banner.setAttribute("hidden", "");
      }
      layer.classList.remove("is-winding-down");
      layer.setAttribute("hidden", "");
      layer.innerHTML = "";
    }, celebrationDuration);
  }

  // Public API
  window.DJMarkyBoyCelebration = {
    DEFAULT_LAUNCH_AT,
    LAUNCH_AT,
    CELEBRATION_END,
    isCelebrationPeriod,
    shouldShowLaunchEffects,
    DEV_PANEL_PARAM,
    buildTestUrl,
    startTestCountdown,
    clearTestCountdown,
    runLaunchFlash
  };
})();
