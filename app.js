// =========================================================
// parlox.cc · shared controller
// Vanilla ES module, no deps. Runs on BOTH the home and the
// /crypto sub-page; every bind/init step safely no-ops when its
// target elements are absent.
//   - i18n ES/EN (data-i18n / data-i18n-aria), ?lang mirror,
//     localStorage persistence.
//   - Theme light/dark with circular View-Transition wipe
//     (instant fallback + reduced-motion).
//   - Anti-scrape phone (char codes) + email (data-* rebuild).
//   - QR popover (collision-aware flip).
//   - Copy buttons (the /crypto page).
//   - Signature (home): selecting a mosaic cell floods the global stage
//     with its brand color from the click origin, prints the big kinetic
//     numeral and surfaces the cell's moment (slogan + preview line) in
//     place — the cell interior stays legible (no in-cell flood). It
//     auto-reverts to the initial neutral state after 10s of no interaction.
//   - Kinetic intro that settles into the slim resting overture.
// =========================================================
const STORAGE_KEYS = { theme: "parlox.theme", lang: "parlox.lang" };
const PHONE_CODES = [53, 57, 51, 57, 56, 55, 49, 52, 51, 57, 48, 57];
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

// The active selection reverts to the on-load neutral state after
// this idle window; any card press resets the countdown.
const FLOOD_REVERT_MS = 10000;

// ---------- i18n ----------
const dict = {
  es: {
    contact: "Contáctame",
    tagline: "Cinco frentes, una vocación.",
    "hero.eyebrow": "Cinco frentes",
    "directory.title": "Los cinco frentes",
    "directory.hint": "Elige uno para abrirlo",
    "footer.made": "Hecho con",
    "footer.ai": "Asistido con IA",
    "footer.os": "Código abierto en",
    "a11y.skip": "Saltar al contenido",
    "a11y.theme": "Cambiar tema",
    "a11y.lang": "Cambiar idioma",
    "a11y.openFront": "Abrir frente",
    "area.tech": "Tecnología",
    "area.theo": "Teología",
    "area.edu": "Educación",
    "area.found": "Fundación",
    "area.min": "Iglesia local",
    "slogan.tech": "Conectados logramos más.",
    "slogan.theo":
      "Conversemos de Dios y la Biblia mientras tomamos un cafecito.",
    "slogan.edu": "Nivelación y asesoría educativa.",
    "slogan.found": "Por una educación libre y saludable.",
    "slogan.min": "Una familia que glorifica a Dios.",
    "desc.tech":
      "Estudio de tecnología que diseña y opera productos digitales propios.",
    "desc.theo":
      "Conversaciones de teología y Biblia en lenguaje cercano, sin academicismos.",
    "desc.edu": "Academia de nivelación y acompañamiento para estudiantes.",
    "desc.found": "Iniciativa por una educación accesible, libre y saludable.",
    "desc.min": "Comunidad de fe local: una familia que camina junta.",
    "status.activo": "activo",
    "status.proximo": "próximo",
    "link.soon": "próximamente",
    "qd.cryptoNote": "Dale clic para ver todas mis direcciones crypto →",
    "crypto.back": "← Volver",
    "crypto.eyebrow": "Direcciones crypto",
    "crypto.title": "Recibir crypto",
    "crypto.intro":
      "Estas son mis direcciones para recibir criptomonedas. Antes de enviar, confirma su autenticidad con la firma PGP al pie de la página.",
    "crypto.copy": "Copiar dirección",
    "crypto.btcNet": "Red: Bitcoin (nativo SegWit, bech32).",
    "crypto.ethNet": "Red: Ethereum (EVM). Confirma la red antes de enviar.",
    "crypto.verifyTitle": "Verificación PGP",
    "crypto.verifyIntro":
      "Estas direcciones están firmadas con mi clave PGP privada. Cualquiera puede comprobar que no fueron alteradas: descarga mi clave pública, impórtala y verifica el bloque firmado de abajo. Si una dirección fue manipulada, la verificación falla.",
    "crypto.keyLabel": "Clave pública:",
    "crypto.wkd": "Autodiscovery WKD en",
    "crypto.howto": "Comprobar:",
    "wa.message": "Hola, vengo de parlox.cc",
    "mail.subject": "Hola desde parlox.cc",
  },
  en: {
    contact: "Contact me",
    tagline: "Five fronts, one calling.",
    "hero.eyebrow": "Five fronts",
    "directory.title": "The five fronts",
    "directory.hint": "Pick one to open it",
    "footer.made": "Made with",
    "footer.ai": "AI Assisted",
    "footer.os": "Open source on",
    "a11y.skip": "Skip to content",
    "a11y.theme": "Toggle theme",
    "a11y.lang": "Toggle language",
    "a11y.openFront": "Open front",
    "area.tech": "Technology",
    "area.theo": "Theology",
    "area.edu": "Education",
    "area.found": "Foundation",
    "area.min": "Local church",
    "slogan.tech": "Connected, we achieve more.",
    "slogan.theo": "Let's talk about God and the Bible over a coffee.",
    "slogan.edu": "Tutoring and educational guidance.",
    "slogan.found": "For a free and healthy education.",
    "slogan.min": "A family that glorifies God.",
    "desc.tech":
      "A technology studio that builds and runs its own digital products.",
    "desc.theo": "Down-to-earth conversations about theology and the Bible.",
    "desc.edu": "An academy for tutoring and student support.",
    "desc.found": "An initiative for accessible, free and healthy education.",
    "desc.min": "A local faith community — a family walking together.",
    "status.activo": "active",
    "status.proximo": "upcoming",
    "link.soon": "coming soon",
    "qd.cryptoNote": "Click to see all my crypto addresses →",
    "crypto.back": "← Back",
    "crypto.eyebrow": "Crypto addresses",
    "crypto.title": "Receive crypto",
    "crypto.intro":
      "These are my addresses for receiving cryptocurrency. Before you send, confirm they are authentic using the PGP signature at the foot of the page.",
    "crypto.copy": "Copy address",
    "crypto.btcNet": "Network: Bitcoin (native SegWit, bech32).",
    "crypto.ethNet":
      "Network: Ethereum (EVM). Double-check the network before sending.",
    "crypto.verifyTitle": "PGP verification",
    "crypto.verifyIntro":
      "These addresses are signed with my private PGP key. Anyone can check they haven't been tampered with: download my public key, import it, and verify the signed block below. If an address was altered, verification fails.",
    "crypto.keyLabel": "Public key:",
    "crypto.wkd": "WKD auto-discovery at",
    "crypto.howto": "To verify:",
    "wa.message": "Hi, I came from parlox.cc",
    "mail.subject": "Hi from parlox.cc",
  },
};

// Per-front data model (links + label rendered into the cell moment).
const FRONTS = {
  tech:  { area: "area.tech",  brand: "Parlox Network",     slogan: "slogan.tech",  desc: "desc.tech",  href: "https://parlox.net",           label: "parlox.net",            external: true,  glyph: "tech" },
  theo:  { area: "area.theo",  brand: "Cafecito Teológico", slogan: "slogan.theo",  desc: "desc.theo",  href: "https://cafecito.cc",          label: "cafecito.cc",           external: true,  glyph: "theo" },
  edu:   { area: "area.edu",   brand: "Cedesco Academia",   slogan: "slogan.edu",   desc: "desc.edu",   href: "#",                            label: "@cedes",                external: false, glyph: "edu" },
  found: { area: "area.found", brand: "Educalisa",          slogan: "slogan.found", desc: "desc.found", href: "#",                            label: "link.soon",             external: false, glyph: "found" },
  min:   { area: "area.min",   brand: "Alianza República",  slogan: "slogan.min",   desc: "desc.min",   href: "https://alianzarepublica.org", label: "alianzarepublica.org",  external: true,  glyph: "min" },
};

// Brand motif glyphs (the tech motif is the reserved square logo
// loaded as <img>; root-relative asset path).
const GLYPHS = {
  tech:  `<img class="glyph-tech" src="assets/reserved/parlox-network.svg" alt="" width="180" height="180" />`,
  theo:  `<svg viewBox="0 0 100 140" aria-hidden="true"><path fill="currentColor" d="M42 8h16v34h34v16H58v74H42V58H8V42h34z"/></svg>`,
  edu:   `<svg viewBox="0 0 140 100" aria-hidden="true"><path fill="currentColor" d="M70 18C54 6 30 6 12 14v74c18-7 42-7 58 5 16-12 40-12 58-5V14C110 6 86 6 70 18m-6 13v55c-14-7-32-7-46-3V28c14-5 32-4 46 3m12 0c14-7 32-6 46-3v55c-14-4-32-4-46 3z"/></svg>`,
  found: `<svg viewBox="0 0 120 130" aria-hidden="true"><path d="M60 124V70m0 0C60 44 40 30 14 30c0 28 18 44 46 40m0-6c0-26 20-42 46-42 0 28-18 44-46 42" stroke="currentColor" stroke-width="9" fill="none" stroke-linecap="round"/></svg>`,
  min:   `<svg viewBox="0 0 120 130" aria-hidden="true"><path fill="currentColor" d="M60 6 16 36v88h28V84a16 16 0 0 1 32 0v40h28V36zM52 50h16v16H52z"/></svg>`,
};

const state = {
  lang: document.documentElement.getAttribute("lang") || "es",
  theme:
    document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark",
  front: null,
};

const t = (key) =>
  (dict[state.lang] && dict[state.lang][key]) || (dict.es[key] ?? "");

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const v = t(key);
    if (v) el.textContent = v;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    const v = t(key);
    if (v) el.setAttribute("aria-label", v);
  });
  document.documentElement.setAttribute("lang", state.lang);

  const url = new URL(location.href);
  if (state.lang === "es") url.searchParams.delete("lang");
  else url.searchParams.set("lang", state.lang);
  history.replaceState(null, "", url);

  // Refresh per-cell aria labels + any open moment in the new language.
  document.querySelectorAll(".cell").forEach((cell) => {
    const key = cell.dataset.front;
    const f = FRONTS[key];
    if (f)
      cell.setAttribute(
        "aria-label",
        `${t("a11y.openFront")} · ${t(f.area)} · ${f.brand}`
      );
  });
  document.querySelectorAll(".cell").forEach((cell) => fillCellMoment(cell));
}

function toggleLang() {
  state.lang = state.lang === "es" ? "en" : "es";
  try {
    localStorage.setItem(STORAGE_KEYS.lang, state.lang);
  } catch {}
  applyI18n();
}

// ---------- Theme (circular View-Transition wipe) ----------
function commitTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.setAttribute("aria-pressed", String(state.theme === "dark"));
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(STORAGE_KEYS.theme, state.theme);
  } catch {}

  const canAnimate =
    typeof document.startViewTransition === "function" &&
    !prefersReducedMotion.matches;

  if (!canAnimate) {
    commitTheme();
    return;
  }

  const btn = document.getElementById("theme-toggle");
  const rect = btn?.getBoundingClientRect();
  const cx = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
  const cy = rect ? rect.top + rect.height / 2 : 40;
  const endRadius = Math.hypot(
    Math.max(cx, window.innerWidth - cx),
    Math.max(cy, window.innerHeight - cy)
  );

  const transition = document.startViewTransition(() => commitTheme());
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${cx}px ${cy}px)`,
            `circle(${endRadius}px at ${cx}px ${cy}px)`,
          ],
        },
        {
          duration: 440,
          easing: "cubic-bezier(0.77, 0, 0.175, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {});
}

// ---------- WhatsApp (anti-scrape phone) ----------
function openWhatsApp() {
  const phone = String.fromCharCode(...PHONE_CODES);
  const text = encodeURIComponent(t("wa.message"));
  window.open(
    `https://wa.me/${phone}?text=${text}`,
    "_blank",
    "noopener,noreferrer"
  );
}

// ---------- Email (rebuilt from data-* at runtime) ----------
function bindEmail() {
  document
    .querySelectorAll("[data-email-user][data-email-host]")
    .forEach((el) => {
      const addr = `${el.getAttribute("data-email-user")}@${el.getAttribute(
        "data-email-host"
      )}`;
      el.textContent = addr;
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const subject = encodeURIComponent(t("mail.subject"));
        window.location.href = `mailto:${addr}?subject=${subject}`;
      });
    });
}

// ---------- QR popover (collision-aware flip) ----------
function bindQrPopover() {
  const qd = document.getElementById("qd-crypto");
  if (!qd) return;
  const place = () => {
    const chip = qd.getBoundingClientRect();
    const qr = qd.querySelector(".qd-qr");
    if (!qr) return;
    const needed = qr.offsetHeight + 16;
    // Default opens DOWN; flip UP only when there isn't room below.
    const roomBelow = window.innerHeight - chip.bottom;
    qd.classList.toggle("flip-up", roomBelow < needed);
  };
  qd.addEventListener("mouseenter", place);
  qd.addEventListener("focusin", place);
  window.addEventListener("resize", place, { passive: true });
}

// ---------- Copy buttons (/crypto page) ----------
// The label changes under blur: instead of two texts crossing
// ("Copy address" <-> "Copied"), the eye reads one object that
// mutates. Cheap (blur < 4px). No-ops on the home (no [data-copy]).
function bindCopy() {
  document.querySelectorAll("[data-copy]").forEach((b) => {
    const label = b.querySelector("span") || b;
    b.addEventListener("click", () => {
      const src = document.getElementById(b.getAttribute("data-copy"));
      if (!src || !navigator.clipboard) return;
      navigator.clipboard.writeText(src.textContent.trim()).then(() => {
        const prev = label.textContent;
        b.classList.add("is-swapping");
        // Swap mid-blur (when the text is unreadable).
        setTimeout(() => {
          label.textContent = state.lang === "es" ? "Copiado ✓" : "Copied ✓";
          b.classList.remove("is-swapping");
        }, 180);
        setTimeout(() => {
          b.classList.add("is-swapping");
          setTimeout(() => {
            label.textContent = prev;
            b.classList.remove("is-swapping");
          }, 180);
        }, 1600);
      });
    });
  });
}

// ---------- The signature: flooded mosaic cells (home only) ----------
const stageFlood = document.querySelector(".stage-flood");
const numeralEl = document.getElementById("stage-numeral");

// The on-load neutral resting state, captured so the auto-revert
// can restore it exactly with NO card opened.
const INITIAL_REST = {
  front: "tech",
  fx: "78%",
  fy: "30%",
};

// Single idle timer: each selection (re)arms it; on expiry the page
// reverts to the initial neutral state using the un-flood transition.
let floodRevertTimer = null;

function clearFloodRevert() {
  if (floodRevertTimer !== null) {
    clearTimeout(floodRevertTimer);
    floodRevertTimer = null;
  }
}

function armFloodRevert() {
  clearFloodRevert();
  floodRevertTimer = window.setTimeout(revertToInitial, FLOOD_REVERT_MS);
}

// Revert to the page's INITIAL on-load state: clear active/flooded,
// reset every cell's pressed/aria-current/moment, and restore the
// resting tint. Uses the existing un-flood transition.
function revertToInitial() {
  clearFloodRevert();
  state.front = null;
  document.querySelectorAll(".cell").forEach((c) => {
    c.setAttribute("aria-pressed", "false");
    c.removeAttribute("aria-current");
    const link = c.querySelector(".cell-link");
    const moment = c.querySelector(".cell-moment");
    if (link) link.tabIndex = -1;
    if (moment) moment.setAttribute("aria-hidden", "true");
  });
  document.body.classList.remove("is-flooded");
  document.body.dataset.front = INITIAL_REST.front;
  document.body.style.setProperty("--flood-x", INITIAL_REST.fx);
  document.body.style.setProperty("--flood-y", INITIAL_REST.fy);
  if (numeralEl) numeralEl.textContent = "";
}

// Populate a cell's glyph + moment (slogan, link) from the data model.
function fillCellMoment(cell) {
  const key = cell.dataset.front;
  const f = FRONTS[key];
  if (!f) return;
  const glyphHost = cell.querySelector(".cell-glyph");
  if (glyphHost && !glyphHost.dataset.filled) {
    glyphHost.innerHTML = GLYPHS[f.glyph];
    glyphHost.dataset.filled = "1";
  }
  const slogan = cell.querySelector(".cell-slogan");
  const desc = cell.querySelector(".cell-desc");
  const link = cell.querySelector(".cell-link");
  const linkLabel = cell.querySelector(".cell-link-label");
  if (slogan) slogan.textContent = t(f.slogan);
  if (desc) desc.textContent = t(f.desc);
  if (linkLabel) linkLabel.textContent = t(f.label);
  if (link) {
    link.setAttribute("href", f.href);
    if (f.external) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    } else {
      link.removeAttribute("target");
      link.setAttribute("rel", "noopener noreferrer");
    }
  }
}

function selectFront(cell, origin) {
  const key = cell.dataset.front;
  const same = state.front === key;
  state.front = same ? null : key;

  // ANY card press resets the idle countdown. If the press deselects
  // the open cell we revert immediately and disarm the timer.
  if (state.front) {
    armFloodRevert();
  } else {
    clearFloodRevert();
  }

  document.querySelectorAll(".cell").forEach((c) => {
    const on = c.dataset.front === state.front;
    c.setAttribute("aria-pressed", String(on));
    if (on) c.setAttribute("aria-current", "true");
    else c.removeAttribute("aria-current");
    // Only the open cell's link is reachable by keyboard/tab.
    const link = c.querySelector(".cell-link");
    const moment = c.querySelector(".cell-moment");
    if (link) link.tabIndex = on ? 0 : -1;
    if (moment) moment.setAttribute("aria-hidden", String(!on));
  });

  if (state.front) {
    // Global stage flood: origin at the click point in viewport coords.
    if (origin) {
      document.body.style.setProperty("--flood-x", `${origin.x}px`);
      document.body.style.setProperty("--flood-y", `${origin.y}px`);
    }
    document.body.dataset.front = key;
    if (numeralEl) numeralEl.textContent = cell.dataset.numeral || "";
    requestAnimationFrame(() => document.body.classList.add("is-flooded"));
  } else {
    // Deselected the open cell: return to the initial neutral state.
    revertToInitial();
  }
}

function bindFronts() {
  const cells = document.querySelectorAll(".cell");
  if (cells.length === 0) return; // no mosaic on /crypto — safe no-op
  cells.forEach((cell) => {
    fillCellMoment(cell);
    cell.addEventListener("click", (e) => {
      // Let the in-cell link navigate without toggling the cell shut.
      if (e.target.closest(".cell-link")) return;
      const r = cell.getBoundingClientRect();
      selectFront(cell, {
        x: e.clientX || r.left + r.width / 2,
        y: e.clientY || r.top + r.height / 2,
      });
    });
    // role="button" needs explicit Enter/Space activation; ignore keys
    // that originate on the in-cell link so it keeps its own behaviour.
    cell.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      if (e.target.closest(".cell-link")) return;
      e.preventDefault();
      const r = cell.getBoundingClientRect();
      selectFront(cell, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    });
  });
}

// ---------- The kinetic intro → settled overture (home only) ----------
function runIntro() {
  const intro = document.getElementById("intro");
  if (!intro) return; // no intro overlay on /crypto — safe no-op
  if (prefersReducedMotion.matches) {
    document.body.classList.add("intro-skip");
    return;
  }
  // Hold the big name briefly, then settle into the slim overture.
  setTimeout(() => document.body.classList.add("intro-done"), 1050);
}

// ---------- Init ----------
function init() {
  applyI18n();
  commitTheme();
  bindEmail();
  bindQrPopover();
  bindCopy();
  bindFronts();
  runIntro();

  // Home only: rest with the tech red as the accent tint, but NO cell
  // opened — the mosaic itself is the protagonist, all five legible at
  // once. Guarded so it's a no-op on /crypto (no mosaic present).
  if (document.querySelector(".mosaic")) {
    document.body.dataset.front = INITIAL_REST.front;
    document.body.style.setProperty("--flood-x", INITIAL_REST.fx);
    document.body.style.setProperty("--flood-y", INITIAL_REST.fy);
  }

  document.getElementById("wa-btn")?.addEventListener("click", openWhatsApp);
  document
    .getElementById("theme-toggle")
    ?.addEventListener("click", toggleTheme);
  document.getElementById("lang-toggle")?.addEventListener("click", toggleLang);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
