/* =====================================================================
   ESCP Economics Seminar Series — application logic
   Renders seminars from data.js, handles filtering, the countdown,
   the detail modal, calendar export and assorted UI niceties.
   ===================================================================== */
(function () {
  "use strict";

  const data = (window.SEMINARS || []).slice();

  /* --------------------------- helpers ----------------------------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const parseDate = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const startOfToday = () => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  };

  const fmtFull = (s) =>
    parseDate(s).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const escapeHtml = (str = "") =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Deterministic, on-brand gradient avatar from a name */
  const hashStr = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return Math.abs(h);
  };
  const initials = (name) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

  const avatarGradient = (name) => {
    const h = hashStr(name);
    const hue = 250 + (h % 80);          // ESCP violet → magenta band
    const hue2 = (hue + 35) % 360;
    return `linear-gradient(135deg, hsl(${hue} 62% 52%), hsl(${hue2} 70% 42%))`;
  };

  const avatarHtml = (name, cls = "avatar") =>
    `<div class="${cls}" style="background:${avatarGradient(name)}">${escapeHtml(initials(name))}</div>`;

  /* Speaker image with graceful fallback to a generated avatar */
  const portraitHtml = (sp, cls = "avatar") => {
    if (sp.photo) {
      const fallback = avatarHtml(sp.name, cls).replace(/"/g, "&quot;");
      return `<img src="${escapeHtml(sp.photo)}" alt="${escapeHtml(sp.name)}" loading="lazy"
                 onerror="this.insertAdjacentHTML('afterend', this.dataset.fallback); this.remove();"
                 data-fallback="${fallback}">`;
    }
    return avatarHtml(sp.name, cls);
  };

  /* Inline icons */
  const ICON = {
    cal:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    link:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  const modeLabel = { "in-person": "In person", online: "Online", hybrid: "Hybrid" };

  const metaPill = (icon, text) => `<span class="meta">${icon}${escapeHtml(text)}</span>`;

  /* Research fields colour-coded with ESCP's categorical palette */
  const FIELD_COLORS = {
    "Macroeconomics":   "#0079c0",
    "Finance":          "#37a5e2",
    "Labour":           "#679d3f",
    "Trade":            "#d06516",
    "Economics of AI":  "#e7006c",
    "Development":      "#009944",
    "Microeconomics":   "#eec343",
    "Environmental":    "#a5bd31",
    "Econometrics":     "#60d0e4",
    "Theory":           "#c9412e"
  };
  const fieldColor = (f) => FIELD_COLORS[f] || "#e7006c";

  /* Pick black/white text for legibility on a given background colour */
  const idealInk = (hex) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#1A0850" : "#ffffff";
  };

  /* Inline custom-property style string keying a card/item to its field colour */
  const fieldStyle = (field) => {
    const col = fieldColor(field);
    return `--field:${col};--field-ink:${idealInk(col)}`;
  };

  /* --------------------------- partition ---------------------------- */
  const today = startOfToday();
  data.sort((a, b) => parseDate(a.date) - parseDate(b.date));
  const upcoming = data.filter((s) => parseDate(s.date) >= today);
  const past = data.filter((s) => parseDate(s.date) < today).reverse(); // most recent first

  /* ----------------------- spotlight + countdown -------------------- */
  let countdownTimer = null;

  function renderSpotlight() {
    const el = $("#spotlight");
    if (!upcoming.length) {
      el.innerHTML = `<div class="spotlight__skeleton">No seminar scheduled yet — check back soon.</div>`;
      return;
    }
    const s = upcoming[0];
    const dt = parseDate(s.date);

    el.innerHTML = `
      <div class="spotlight__tag"><span class="live"></span> Next seminar</div>
      <div class="spotlight__top">
        <div style="width:64px;height:64px;border-radius:14px;overflow:hidden;flex:none">${portraitHtml(s.speaker)}</div>
        <div>
          <div class="spotlight__speaker"><strong>${escapeHtml(s.speaker.name)}</strong><br>${escapeHtml(s.speaker.affiliation)}</div>
        </div>
      </div>
      <h3 class="spotlight__title">${escapeHtml(s.title)}</h3>
      <div class="spotlight__meta">
        ${metaPill(ICON.cal, parseDate(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }))}
        ${metaPill(ICON.clock, s.time)}
        ${metaPill(ICON.pin, s.location)}
      </div>
      <div class="countdown" id="countdown" aria-label="Time until next seminar"></div>
      <div class="spotlight__actions">
        <button class="btn btn--primary btn--sm" data-open="${s.id}">View details ${ICON.arrow}</button>
        <button class="btn btn--ghost btn--sm" data-ics="${s.id}">Add to calendar</button>
      </div>`;

    /* countdown to the seminar start time */
    const startTime = (s.time.match(/(\d{1,2}):(\d{2})/) || [null, 16, 0]);
    dt.setHours(Number(startTime[1]) || 16, Number(startTime[2]) || 0, 0, 0);

    const cd = $("#countdown");
    const tick = () => {
      const diff = dt - new Date();
      if (diff <= 0) {
        cd.innerHTML = `<div class="countdown__cell" style="flex:1"><div class="countdown__num">Live</div><div class="countdown__lbl">happening now</div></div>`;
        clearInterval(countdownTimer);
        return;
      }
      const days = Math.floor(diff / 864e5);
      const hrs = Math.floor((diff % 864e5) / 36e5);
      const mins = Math.floor((diff % 36e5) / 6e4);
      const secs = Math.floor((diff % 6e4) / 1e3);
      const cell = (n, l) => `<div class="countdown__cell"><div class="countdown__num">${String(n).padStart(2, "0")}</div><div class="countdown__lbl">${l}</div></div>`;
      cd.innerHTML = cell(days, "days") + cell(hrs, "hrs") + cell(mins, "min") + cell(secs, "sec");
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  /* --------------------------- card markup -------------------------- */
  function cardHtml(s) {
    const dt = parseDate(s.date);
    const tag = s.field ? `<span class="tag">${escapeHtml(s.field)}</span>` : "";
    const isOnline = s.mode === "online";
    return `
      <article class="card reveal" data-open="${s.id}" data-field="${escapeHtml(s.field || "")}" style="${fieldStyle(s.field)}">
        <div class="card__date"><span class="d-day">${dt.getDate()}</span><span class="d-mon">${MONTHS[dt.getMonth()]}</span></div>
        <span class="card__mode ${isOnline ? "is-online" : ""}">${modeLabel[s.mode] || s.mode}</span>
        <div class="card__media">${portraitHtml(s.speaker)}</div>
        <div class="card__body">
          ${tag}
          <h3 class="card__title">${escapeHtml(s.title)}</h3>
          <div class="card__speaker">
            <strong>${escapeHtml(s.speaker.name)}</strong> · ${escapeHtml(s.speaker.affiliation)}
          </div>
          <p class="card__abstract">${escapeHtml(s.abstract)}</p>
          <div class="card__foot">
            <span class="card__meta-time">${ICON.clock} ${escapeHtml(s.time)}</span>
            <span class="card__more">Details ${ICON.arrow}</span>
          </div>
        </div>
      </article>`;
  }

  function renderUpcoming(filter = "All") {
    const wrap = $("#upcomingList");
    const empty = $("#upcomingEmpty");
    const list = filter === "All" ? upcoming : upcoming.filter((s) => s.field === filter);
    wrap.innerHTML = list.map(cardHtml).join("");
    empty.hidden = list.length > 0;
    wrap.scrollLeft = 0;
    observeReveals();
    updateCarousel();
  }

  /* -------------------------- past markup --------------------------- */
  function pastItemHtml(s) {
    const dt = parseDate(s.date);
    const links = s.links || {};
    const pills = [];
    if (links.recording) pills.push(`<a class="pill" href="${escapeHtml(links.recording)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Recording</a>`);
    if (links.slides)    pills.push(`<a class="pill" href="${escapeHtml(links.slides)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Slides</a>`);
    if (links.paper)     pills.push(`<a class="pill" href="${escapeHtml(links.paper)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Paper</a>`);
    return `
      <div class="past-item reveal" data-open="${s.id}" style="${fieldStyle(s.field)}">
        <div class="past-item__date"><div class="pd-day">${dt.getDate()} ${MONTHS[dt.getMonth()]}</div><div class="pd-yr">${dt.getFullYear()}</div></div>
        <div class="past-item__main">
          <div class="past-item__title">${escapeHtml(s.title)}</div>
          <div class="past-item__speaker"><strong>${escapeHtml(s.speaker.name)}</strong> · ${escapeHtml(s.speaker.affiliation)} · ${escapeHtml(s.field || "")}</div>
        </div>
        <div class="past-item__links">${pills.join("")}</div>
      </div>`;
  }

  function renderPast(year = "All") {
    const wrap = $("#pastList");
    const empty = $("#pastEmpty");
    const list = year === "All" ? past : past.filter((s) => parseDate(s.date).getFullYear() === Number(year));
    wrap.innerHTML = list.map(pastItemHtml).join("");
    empty.hidden = list.length > 0;
    observeReveals();
  }

  /* ---------------------------- filters ----------------------------- */
  function buildUpcomingFilters() {
    const box = $("#upcomingFilters");
    if (!upcoming.length) return;
    const fields = ["All", ...new Set(upcoming.map((s) => s.field).filter(Boolean))];
    box.innerHTML = fields
      .map((f, i) => {
        const count = f === "All" ? upcoming.length : upcoming.filter((s) => s.field === f).length;
        return `<button class="chip ${i === 0 ? "is-active" : ""}" data-filter="${escapeHtml(f)}">${escapeHtml(f)}<span class="chip__count">${count}</span></button>`;
      })
      .join("");
    box.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      $$(".chip", box).forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      renderUpcoming(chip.dataset.filter);
    });
  }

  function buildPastFilters() {
    const box = $("#pastFilters");
    if (!past.length) return;
    const years = ["All", ...new Set(past.map((s) => String(parseDate(s.date).getFullYear())))];
    box.innerHTML = years
      .map((y, i) => `<button class="chip ${i === 0 ? "is-active" : ""}" data-year="${y}">${y}</button>`)
      .join("");
    box.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      $$(".chip", box).forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      renderPast(chip.dataset.year);
    });
  }

  /* ----------------------------- modal ------------------------------ */
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  const modalPanel = $(".modal__panel", modal);

  function openModal(id) {
    const s = data.find((x) => x.id === id);
    if (!s) return;
    modalPanel.setAttribute("style", fieldStyle(s.field));
    const links = s.links || {};
    const linkBtns = [];
    if (s.speaker.website) linkBtns.push(`<a class="btn btn--primary btn--sm" href="${escapeHtml(s.speaker.website)}" target="_blank" rel="noopener">${ICON.link} Speaker website</a>`);
    if (links.paper)     linkBtns.push(`<a class="btn btn--ghost btn--sm" href="${escapeHtml(links.paper)}" target="_blank" rel="noopener">Paper</a>`);
    if (links.slides)    linkBtns.push(`<a class="btn btn--ghost btn--sm" href="${escapeHtml(links.slides)}" target="_blank" rel="noopener">Slides</a>`);
    if (links.recording) linkBtns.push(`<a class="btn btn--ghost btn--sm" href="${escapeHtml(links.recording)}" target="_blank" rel="noopener">Recording</a>`);
    if (parseDate(s.date) >= today) linkBtns.push(`<button class="btn btn--ghost btn--sm" data-ics="${s.id}">Add to calendar</button>`);

    modalBody.innerHTML = `
      <div class="modal__hero">${portraitHtml(s.speaker)}</div>
      <div class="modal__content">
        ${s.field ? `<span class="tag">${escapeHtml(s.field)}</span>` : ""}
        <h2 id="modalTitle">${escapeHtml(s.title)}</h2>
        <div class="modal__speaker">
          <div style="width:52px;height:52px;border-radius:50%;overflow:hidden;flex:none">${portraitHtml(s.speaker)}</div>
          <div>
            <div class="ms-name">${escapeHtml(s.speaker.name)}</div>
            <div class="ms-aff">${escapeHtml(s.speaker.affiliation)}</div>
          </div>
        </div>
        <div class="modal__meta">
          ${metaPill(ICON.cal, fmtFull(s.date))}
          ${metaPill(ICON.clock, s.time)}
          ${metaPill(ICON.pin, s.location)}
          ${metaPill("", modeLabel[s.mode] || s.mode)}
        </div>
        <div class="modal__section-label">Abstract</div>
        <p class="modal__abstract">${escapeHtml(s.abstract)}</p>
        <div class="modal__actions">${linkBtns.join("")}</div>
      </div>`;

    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  /* ----------------------- calendar (.ics) -------------------------- */
  function pad(n) { return String(n).padStart(2, "0"); }
  function icsStamp(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00";
  }
  function downloadICS(id) {
    const s = data.find((x) => x.id === id);
    if (!s) return;
    const start = parseDate(s.date);
    const m = s.time.match(/(\d{1,2}):(\d{2})/g) || [];
    const [sh, sm] = (m[0] || "16:00").split(":").map(Number);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(start);
    if (m[1]) { const [eh, em] = m[1].split(":").map(Number); end.setHours(eh, em, 0, 0); }
    else { end.setMinutes(end.getMinutes() + 75); }

    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ESCP Economics Seminar Series//EN",
      "BEGIN:VEVENT",
      "UID:" + s.id + "@escp-econ-seminars",
      "DTSTART:" + icsStamp(start),
      "DTEND:" + icsStamp(end),
      "SUMMARY:" + ("Econ Seminar — " + s.speaker.name + " (" + s.speaker.affiliation + ")").replace(/,/g, "\\,"),
      "DESCRIPTION:" + (s.title + " — " + s.abstract).replace(/[,;]/g, "\\$&").replace(/\n/g, "\\n"),
      "LOCATION:" + s.location.replace(/,/g, "\\,"),
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = s.id + ".ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  /* --------------------- global click handling ---------------------- */
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener && !e.target.closest("a")) { openModal(opener.dataset.open); return; }

    const ics = e.target.closest("[data-ics]");
    if (ics) { e.stopPropagation(); downloadICS(ics.dataset.ics); return; }

    if (e.target.closest("[data-close]")) { closeModal(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  /* --------------------------- reveals ------------------------------ */
  let revealObserver;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((el) => el.classList.add("is-in")); return; }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("is-in"); revealObserver.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
    }
    $$(".reveal:not(.is-in)").forEach((el, i) => {
      el.style.transitionDelay = Math.min(i * 60, 360) + "ms";
      revealObserver.observe(el);
    });
  }

  /* ------------------------- carousel ------------------------------- */
  let updateCarousel = () => {};

  function initCarousel() {
    const track = $("#upcomingList");
    if (!track) return;
    const carousel = $("#upcomingCarousel");
    const prev = $("#upcomingPrev");
    const next = $("#upcomingNext");
    const bar = $("#upcomingBar");
    const barTrack = $("#upcomingBarTrack");

    const stepSize = () => {
      const card = track.querySelector(".card");
      return card ? card.getBoundingClientRect().width + 22 /* gap */ : track.clientWidth * 0.85;
    };

    updateCarousel = () => {
      const max = track.scrollWidth - track.clientWidth;
      const x = track.scrollLeft;
      const overflow = max > 4;
      carousel.classList.toggle("has-overflow", overflow);
      if (barTrack) barTrack.style.display = overflow ? "" : "none";
      if (prev) prev.disabled = x <= 2;
      if (next) next.disabled = x >= max - 2;
      if (bar && overflow) {
        bar.style.width = (track.clientWidth / track.scrollWidth * 100) + "%";
        bar.style.left = (track.scrollLeft / track.scrollWidth * 100) + "%";
      }
    };

    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -stepSize(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left: stepSize(), behavior: "smooth" }));
    track.addEventListener("scroll", updateCarousel, { passive: true });
    window.addEventListener("resize", updateCarousel);
    window.addEventListener("load", () => setTimeout(updateCarousel, 60));

    /* click-and-drag to scroll (mouse only; touch uses native swipe) */
    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    const endDrag = () => { down = false; track.classList.remove("is-dragging"); };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    /* swallow the click that ends a drag so it doesn't open the modal */
    track.addEventListener("click", (e) => {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);
  }

  /* --------------------- misc UI behaviours ------------------------- */
  function initNav() {
    const nav = $("#nav");
    const burger = $("#navBurger");
    const links = $("#navLinks");
    const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    burger.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") { links.classList.remove("is-open"); burger.classList.remove("is-open"); }
    });
  }

  function initTheme() {
    const toggle = $("#themeToggle");
    const saved = localStorage.getItem("escp-theme");
    if (saved) document.documentElement.dataset.theme = saved;
    toggle.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("escp-theme", next);
    });
  }

  function initStats() {
    const nums = $$(".stat__num");
    if (!nums.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = Number(el.dataset.count);
        let cur = 0;
        const step = Math.max(1, Math.round(target / 40));
        const t = setInterval(() => {
          cur += step;
          if (cur >= target) { cur = target; clearInterval(t); }
          el.textContent = cur;
        }, 28);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach((n) => io.observe(n));
  }

  function initSubscribe() {
    const form = $("#subscribeForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.reset();
      const note = $("#subscribeNote");
      if (note) note.hidden = false;
    });
  }

  /* ----------------------------- init ------------------------------- */
  function init() {
    $("#year").textContent = new Date().getFullYear();
    renderSpotlight();
    buildUpcomingFilters();
    buildPastFilters();
    initCarousel();
    renderUpcoming();
    renderPast();
    initNav();
    initTheme();
    initStats();
    initSubscribe();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
