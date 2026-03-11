/* ============================================================
   PERSONALIZED IMAGE GENERATOR — script.js
   ============================================================
   All visual & layout settings are grouped in CONFIG below.
   Edit CONFIG freely without touching any other logic.
   ============================================================ */

const CONFIG = {
  templateImage: "./EidTemplate.png",

  canvasWidth: 1152,
  canvasHeight: 2048,

  text: {
    x: 576,
    y: 1600,
    maxWidth: 700,
    baseFontSize: 100,
    minFontSize: 50,
    color: "#c7a27a",
    arabicFontFamily: "'IBM Plex Sans Arabic', sans-serif",
    latinFontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: "600",
    align: "center",
    baseline: "middle",
    shadow: {
      enable: false,
      color: "rgba(0,0,0,0.2)",
      blur: 6,
      offsetX: 0,
      offsetY: 2,
    },
  },

  placeholder: {
    bgGradient: ["#0d0e14", "#1a1630"],
    accentColor: "#c9a96e",
    titleText: "Certificate of Appreciation",
    bodyText: "This certificate is proudly awarded to",
    footerText: "In recognition of outstanding dedication",
  },
};

/* ============================================================
   DOM REFERENCES
============================================================ */
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
const nameInput = document.getElementById("nameInput");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const validationMsg = document.getElementById("validationMsg");
const charCount = document.getElementById("charCount");

/* ============================================================
   STATE
============================================================ */
let templateLoaded = false;
let templateImg = null;
let currentName = "";

/* ============================================================
   INIT
============================================================ */
function init() {
  canvas.width = CONFIG.canvasWidth;
  canvas.height = CONFIG.canvasHeight;

  if (CONFIG.templateImage) {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      templateImg = img;
      templateLoaded = true;
      renderCanvas(currentName);
    };

    img.onerror = () => {
      console.warn("Template image failed to load — using built-in placeholder.");
      templateLoaded = false;
      renderCanvas(currentName);
    };

    img.src = CONFIG.templateImage;
  } else {
    renderCanvas(currentName);
  }
}

/* ============================================================
   DRAW BUILT-IN PLACEHOLDER TEMPLATE
============================================================ */
function drawPlaceholder() {
  const W = CONFIG.canvasWidth;
  const H = CONFIG.canvasHeight;
  const p = CONFIG.placeholder;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, p.bgGradient[0]);
  grad.addColorStop(1, p.bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.025;
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();

  const margin = 40;
  ctx.save();
  ctx.strokeStyle = p.accentColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);
  ctx.globalAlpha = 0.15;
  ctx.strokeRect(margin + 10, margin + 10, W - (margin + 10) * 2, H - (margin + 10) * 2);
  ctx.restore();

  const corners = [
    [margin, margin],
    [W - margin, margin],
    [W - margin, H - margin],
    [margin, H - margin],
  ];

  corners.forEach(([cx, cy]) => {
    drawCornerOrnament(cx, cy, p.accentColor);
  });

  drawHorizontalDivider(W / 2, 130, 320, p.accentColor);

  ctx.save();
  ctx.font = `300 64px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = "#f0ede8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 0.95;
  ctx.fillText(p.titleText, W / 2, 200);
  ctx.restore();

  ctx.save();
  ctx.font = `300 28px "IBM Plex Sans", sans-serif`;
  ctx.fillStyle = "#a09e9a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.bodyText, W / 2, 370);
  ctx.restore();

  drawHorizontalDivider(W / 2, 420, 200, p.accentColor);

  ctx.save();
  ctx.font = `300 22px "IBM Plex Sans", sans-serif`;
  ctx.fillStyle = "#6a6878";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.footerText, W / 2, 700);
  ctx.restore();

  drawHorizontalDivider(W / 2, 660, 320, p.accentColor);
}

function drawCornerOrnament(x, y, color) {
  const len = 30;
  const sign = [
    x < CONFIG.canvasWidth / 2 ? 1 : -1,
    y < CONFIG.canvasHeight / 2 ? 1 : -1,
  ];

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y + sign[1] * len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + sign[0] * len, y);
  ctx.stroke();
  ctx.restore();
}

function drawHorizontalDivider(x, y, width, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - width / 2, y);
  ctx.lineTo(x + width / 2, y);
  ctx.stroke();

  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 30, y);
  ctx.lineTo(x + 30, y);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-4, -4, 8, 8);
  ctx.restore();

  ctx.restore();
}

/* ============================================================
   TEXT HELPERS
============================================================ */
function getDirection(text) {
  const rtlPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return rtlPattern.test(text) ? "rtl" : "ltr";
}

function getFontFamily(text, cfg) {
  return getDirection(text) === "rtl" ? cfg.arabicFontFamily : cfg.latinFontFamily;
}

function fitFontSize(text, cfg) {
  let size = cfg.baseFontSize;
  const fontFamily = getFontFamily(text, cfg);

  ctx.font = `${cfg.fontWeight} ${size}px ${fontFamily}`;

  while (ctx.measureText(text).width > cfg.maxWidth && size > cfg.minFontSize) {
    size -= 2;
    ctx.font = `${cfg.fontWeight} ${size}px ${fontFamily}`;
  }

  return size;
}

/* ============================================================
   RENDER CANVAS
============================================================ */
function renderCanvas(name) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (templateLoaded && templateImg) {
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
  } else {
    drawPlaceholder();
  }

  if (name && name.trim()) {
    const t = CONFIG.text;
    const fontSize = fitFontSize(name, t);
    const fontFamily = getFontFamily(name, t);

    if (t.shadow.enable) {
      ctx.shadowColor = t.shadow.color;
      ctx.shadowBlur = t.shadow.blur;
      ctx.shadowOffsetX = t.shadow.offsetX;
      ctx.shadowOffsetY = t.shadow.offsetY;
    }

    ctx.font = `${t.fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = t.color;
    ctx.textAlign = t.align;
    ctx.textBaseline = t.baseline;
    ctx.direction = getDirection(name);

    ctx.fillText(name, t.x, t.y);

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}

/* ============================================================
   DOWNLOAD AS PNG
============================================================ */
function downloadImage(name) {
  const link = document.createElement("a");
  const safeName = name.trim().replace(/[/\\?%*:|"<>]/g, "_") || "personalized";
  link.download = `certificate-${safeName}.png`;
  link.href = canvas.toDataURL("image/png", 1.0);
  link.click();
}

/* ============================================================
   EVENT LISTENERS
============================================================ */
nameInput.addEventListener("input", () => {
  currentName = nameInput.value;
  charCount.textContent = `${currentName.length} / 60`;
  validationMsg.classList.remove("visible");
  renderCanvas(currentName);
});

downloadBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();

  if (!name) {
    validationMsg.classList.add("visible");
    nameInput.focus();

    nameInput.style.transition = "transform 0.1s";
    nameInput.style.transform = "translateX(6px)";
    setTimeout(() => { nameInput.style.transform = "translateX(-6px)"; }, 100);
    setTimeout(() => { nameInput.style.transform = "translateX(4px)"; }, 200);
    setTimeout(() => { nameInput.style.transform = "translateX(0)"; }, 300);
    return;
  }

  downloadBtn.classList.add("downloading");
  const origText = downloadBtn.querySelector(".btn-text").textContent;
  downloadBtn.querySelector(".btn-text").textContent = "Exporting";

  setTimeout(() => {
    downloadImage(name);
    downloadBtn.classList.remove("downloading");
    downloadBtn.querySelector(".btn-text").textContent = origText;
  }, 350);
});

resetBtn.addEventListener("click", () => {
  nameInput.value = "";
  currentName = "";
  charCount.textContent = "0 / 60";
  validationMsg.classList.remove("visible");
  renderCanvas("");
  nameInput.focus();
});

/* ============================================================
   KICK OFF AFTER FONTS LOAD
============================================================ */
document.fonts.ready.then(() => {
  init();
});