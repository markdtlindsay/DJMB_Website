(() => {
  function createAmbientLasers() {
    const layer = document.getElementById("ambient-effects-layer");
    if (!layer) return;

    layer.innerHTML = "";

    const laserConfigs = [
      { left: "8%", width: 180, duration: 7.5, delay: 0, opacity: 0.16 },
      { left: "22%", width: 140, duration: 6.5, delay: 0.8, opacity: 0.22 },
      { left: "58%", width: 200, duration: 8.5, delay: 0.3, opacity: 0.14 },
      { left: "78%", width: 150, duration: 7.2, delay: 1.1, opacity: 0.2 }
    ];

    laserConfigs.forEach((config, index) => {
      const laser = document.createElement("div");
      laser.className = "ambient-laser";

      laser.style.left = config.left;
      laser.style.width = `${config.width}px`;
      laser.style.opacity = config.opacity;
      laser.style.animationDuration = `${config.duration}s`;
      laser.style.animationDelay = `${config.delay}s`;

      const startAngle = index % 2 === 0 ? -28 : -12;
      const endAngle = index % 2 === 0 ? 12 : 28;

      laser.style.setProperty("--laser-start", `${startAngle}deg`);
      laser.style.setProperty("--laser-end", `${endAngle}deg`);

      layer.appendChild(laser);
    });
  }

  window.DJMarkyBoyAmbient = {
    init() {
      createAmbientLasers();
    }
  };
})();
