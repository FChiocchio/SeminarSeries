# ESCP Economics Seminar Series — website

A self-contained static website for the ESCP Business School Economics
Seminar Series. No build step, no dependencies — just open or upload the files.

## Quick start

Double-click **`index.html`**, or serve the folder:

```powershell
# from this folder
python -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly works too; a local server is only nicer for
testing speaker photos and the calendar export.)

## How to add / edit seminars

Everything lives in one file: **`assets/js/data.js`**.

Add an object to the `SEMINARS` array. The site does the rest:

- events dated **today or later** appear under **Upcoming** (shown as the
  next-seminar spotlight + a slider);
- earlier events drop into **Past** automatically;
- the year filters for Past are generated from your data.

Minimal example:

```js
{
  id: "2026-11-04-speaker",        // any unique string
  date: "2026-11-04",              // YYYY-MM-DD
  time: "12:15–13:15 (Paris time)",
  campus: "Paris",                 // Paris | Madrid | Berlin | London | Turin
  location: "TBC",
  title: "TBC",
  abstract: "TBC",
  speaker: {
    name: "Speaker name",
    affiliation: "TBC",
    website: "",
    photo: ""                      // see below
  },
  links: {                         // all optional
    paper: "https://…",
    slides: "https://…",
    recording: "https://…"
  }
}
```

### Speaker photos

- Put portrait images in `assets/img/speakers/` and set
  `photo: "assets/img/speakers/jane.jpg"`.
- **Leave `photo: ""`** and the site draws a clean coloured “initials”
  avatar automatically — so it looks finished even before you collect photos.
- Roughly square images (≈ 600×600 px) look best.

## Branding

The site uses ESCP's actual identity, taken from the official site:

- **Purple** `#240085`, **magenta** `#e7006c`, white
- Fonts **Montserrat** (headings) + **Lato** (body)
- The official white ESCP logo (`assets/img/ESCP-logo-white.svg`) and the
  ESCP star motif (`assets/img/escp-star.svg`)
- Each seminar card shows its **campus** (Paris / Madrid / Berlin / London / Turin)

The nav, hero and footer stay in immersive purple in both themes so the white
logo always reads. Fine-tune everything via the CSS variables at the top of
`assets/css/styles.css` (`--purple`, `--magenta`, `--gold`, `--bg`, …). A light
theme is included and toggled with the ◐ button in the header.

## Features

- Auto-sorted **Upcoming** / **Past** sections
- **Upcoming** shown as a one-row **slider** (arrows, drag, swipe, snap)
- Each card shows its **campus**
- Speaker cards → click for a **detail modal** (full abstract + links)
- **Filter** past seminars by year
- **Add to calendar** — Google, Outlook, or Apple/`.ics`, using Europe/Paris time
- **Subscribe to calendar** — follow the public Google Calendar and receive schedule updates
- Light / dark theme, mobile menu, scroll-reveal animations
- Works offline; no frameworks

## File layout

```
SeminarSeries/
├─ index.html
├─ README.md
└─ assets/
   ├─ css/styles.css
   ├─ js/
   │  ├─ data.js     ← edit seminars here
   │  └─ app.js      ← rendering & interactions
   └─ img/
      ├─ ESCP-logo-white.svg   ← official ESCP logo
      ├─ escp-star.svg         ← ESCP star motif
      ├─ favicon.svg
      └─ speakers/             ← (create this) drop speaker photos here
```

## Notes

- The Fall 2026 schedule contains confirmed dates and speakers. Details that
  have not yet been supplied are marked **TBC**.
- Contact details and organiser website links are maintained in `index.html`.
