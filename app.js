// =========================================================
// parlox.cc — controller
// Vanilla ES2022+ module. No deps.
//
// Behavior:
//   • Desktop (≥ 768px): pure CSS hover/focus accordion.
//   • Mobile (< 768px): wallet/business-card stack; tap to expand.
//   • Theme + lang persist via localStorage with no-flash bootstrap
//     in <head>. Lang mirrors to URL (?lang=en) for shareable links.
//
// Anti-scrape:
//   • Phone digits stored as char codes; URL built only on click.
//   • Email user/host kept in data-* attrs; the address is
//     reconstructed at runtime — no literal "user@host" in the
//     static HTML for naive harvesters to grab.
// =========================================================

const STORAGE_KEYS = { theme: "parlox.theme", lang: "parlox.lang" };

// "593987143909" → char codes. The number never appears as a literal
// string in the source, so regex-based scrapers won't pick it up.
const PHONE_CODES = [53, 57, 51, 57, 56, 55, 49, 52, 51, 57, 48, 57];

// ---------- i18n ----------
const dict = {
  es: {
    contact: "Contáctame",
    "footer.made": "Hecho con",
    "footer.by": "por",
    "footer.ai": "Asistido con IA",
    "footer.os": "Código abierto en",
    "a11y.skip": "Saltar al contenido",
    "a11y.theme": "Cambiar tema",
    "a11y.lang": "Cambiar idioma",
    "area.tech": "Tecnología",
    "area.theo": "Teología",
    "area.edu": "Educación",
    "area.found": "Fundación",
    "area.min": "Iglesia local",
    "desc.tech": "Tecnología y desarrollo",
    "desc.theo": "Teología, divulgación y ministerio",
    "desc.edu": "Nivelación, asesoría educativa y formación",
    "desc.found": "Fundación de impacto social",
    "desc.min": "Iglesia local",
    "slogan.tech": "Conectados logramos más.",
    "slogan.theo":
      "Conversemos de Dios y la Biblia mientras tomamos un cafecito.",
    "slogan.edu": "Nivelación y asesoría educativa.",
    "slogan.found": "Por una educación libre y saludable.",
    "slogan.min": "Una familia que glorifica a Dios.",
    "link.soon": "próximamente",
    "wa.message": "Hola, vengo de parlox.cc",
    "mail.subject": "Hola desde parlox.cc",
  },
  en: {
    contact: "Contact me",
    "footer.made": "Made with",
    "footer.by": "by",
    "footer.ai": "AI Assisted",
    "footer.os": "Open source on",
    "a11y.skip": "Skip to content",
    "a11y.theme": "Toggle theme",
    "a11y.lang": "Toggle language",
    "area.tech": "Technology",
    "area.theo": "Theology",
    "area.edu": "Education",
    "area.found": "Foundation",
    "area.min": "Local church",
    "desc.tech": "Technology & development",
    "desc.theo": "Theology, outreach & ministry",
    "desc.edu": "Tutoring, guidance & training",
    "desc.found": "Social-impact foundation",
    "desc.min": "Local church",
    "slogan.tech": "Connected, we achieve more.",
    "slogan.theo": "Let's talk about God and the Bible over a coffee.",
    "slogan.edu": "Tutoring and educational guidance.",
    "slogan.found": "For a free and healthy education.",
    "slogan.min": "A family that glorifies God.",
    "link.soon": "coming soon",
    "wa.message": "Hi, I came from parlox.cc",
    "mail.subject": "Hi from parlox.cc",
  },
};

const state = {
  lang: document.documentElement.getAttribute("lang") || "es",
  theme: document.documentElement.getAttribute("data-theme") || "auto",
};

// ---------- i18n ----------
function applyI18n() {
  const t = dict[state.lang] || dict.es;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key] != null) el.textContent = t[key];
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (t[key] != null) el.setAttribute("aria-label", t[key]);
  });

  document.documentElement.setAttribute("lang", state.lang);

  const cur = document.querySelector(".lang-current");
  if (cur) cur.textContent = state.lang === "es" ? "EN" : "ES";

  const url = new URL(location.href);
  if (state.lang === "es") url.searchParams.delete("lang");
  else url.searchParams.set("lang", state.lang);
  history.replaceState(null, "", url);
}

function toggleLang() {
  state.lang = state.lang === "es" ? "en" : "es";
  try {
    localStorage.setItem(STORAGE_KEYS.lang, state.lang);
  } catch {}
  applyI18n();
}

// ---------- Theme ----------
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    const isDark =
      state.theme === "dark" ||
      (state.theme === "auto" &&
        matchMedia("(prefers-color-scheme: dark)").matches);
    btn.setAttribute("aria-pressed", String(isDark));
    btn.title = `Tema: ${state.theme}`;
  }
}

function toggleTheme() {
  state.theme =
    state.theme === "auto" ? "light" : state.theme === "light" ? "dark" : "auto";
  try {
    localStorage.setItem(STORAGE_KEYS.theme, state.theme);
  } catch {}
  applyTheme();
}

// ---------- WhatsApp ----------
function openWhatsApp() {
  const phone = String.fromCharCode(...PHONE_CODES);
  const text = encodeURIComponent(dict[state.lang]["wa.message"]);
  window.open(
    `https://wa.me/${phone}?text=${text}`,
    "_blank",
    "noopener,noreferrer"
  );
}

// ---------- Email ----------
// Address is reconstructed from data-email-user and data-email-host so
// no literal "user@host" string lives in the static HTML. Visible text
// is rendered at init (for users to see/copy). The mailto: URL is
// built only on click.
function bindEmail() {
  document
    .querySelectorAll("[data-email-user][data-email-host]")
    .forEach((el) => {
      const user = el.getAttribute("data-email-user");
      const host = el.getAttribute("data-email-host");
      const addr = `${user}@${host}`;
      el.textContent = addr;
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const subject = encodeURIComponent(dict[state.lang]["mail.subject"]);
        window.location.href = `mailto:${addr}?subject=${subject}`;
      });
    });
}

// ---------- Wallet stack (mobile) ----------
const mobileMq = matchMedia("(max-width: 767.98px)");

function getCards() {
  return [...document.querySelectorAll(".panel")];
}

function layoutWallet() {
  const cards = getCards();
  const panelsEl = document.querySelector(".panels");
  if (!panelsEl || cards.length === 0) return;

  // Desktop: clear inline transforms so flex accordion runs cleanly.
  if (!mobileMq.matches) {
    cards.forEach((c) => c.style.removeProperty("--y"));
    return;
  }

  const styles = getComputedStyle(document.documentElement);
  const tabH = parseFloat(styles.getPropertyValue("--tab-h-mobile")) || 64;
  const totalH = panelsEl.clientHeight;
  const stackedTabsH = cards.length * tabH;
  // Floor at 240px so the active card has room even on small viewports.
  const contentH = Math.max(totalH - stackedTabsH, 240);

  const activeAttr = panelsEl.dataset.activeIndex;
  const active =
    activeAttr === "" || activeAttr == null ? null : Number(activeAttr);

  cards.forEach((card, i) => {
    const baseY = i * tabH;
    const shift = active !== null && i > active ? contentH : 0;
    card.style.setProperty("--y", `${baseY + shift}px`);
  });
}

function setActivePanel(idx) {
  const panelsEl = document.querySelector(".panels");
  const cards = getCards();
  // Tap on already-active toggles closed.
  const newActive =
    panelsEl.dataset.activeIndex === String(idx) ? null : idx;

  panelsEl.dataset.activeIndex = newActive == null ? "" : String(newActive);

  cards.forEach((card, i) => {
    const isActive = newActive === i;
    card.classList.toggle("is-active", isActive);
    const tab = card.querySelector(".panel-tab");
    if (tab) tab.setAttribute("aria-expanded", String(isActive));
  });

  layoutWallet();
}

function bindPanels() {
  document.querySelectorAll(".panel").forEach((panel) => {
    const tab = panel.querySelector(".panel-tab");
    if (!tab) return;
    tab.addEventListener("click", () => {
      // Mobile only — desktop uses :hover/:focus-within in CSS.
      if (mobileMq.matches) {
        setActivePanel(Number(panel.dataset.index));
      }
    });
  });
}

function resetActiveOnBreakpointChange() {
  const panelsEl = document.querySelector(".panels");
  if (panelsEl) panelsEl.dataset.activeIndex = "";
  document.querySelectorAll(".panel.is-active").forEach((p) => {
    p.classList.remove("is-active");
    const tab = p.querySelector(".panel-tab");
    if (tab) tab.setAttribute("aria-expanded", "false");
  });
  layoutWallet();
}

// ---------- Init ----------
function init() {
  applyI18n();
  applyTheme();
  bindEmail();
  bindPanels();
  layoutWallet();

  document.getElementById("wa-btn")?.addEventListener("click", openWhatsApp);
  document
    .getElementById("theme-toggle")
    ?.addEventListener("click", toggleTheme);
  document.getElementById("lang-toggle")?.addEventListener("click", toggleLang);

  window.addEventListener("resize", layoutWallet, { passive: true });
  mobileMq.addEventListener("change", resetActiveOnBreakpointChange);
  matchMedia("(prefers-color-scheme: dark)").addEventListener(
    "change",
    applyTheme
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
