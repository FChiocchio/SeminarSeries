/* =====================================================================
   ESCP Economics Seminar Series — SEMINAR DATA
   ---------------------------------------------------------------------
   This is the ONLY file you normally need to edit to manage the series.
   Add / remove entries in the SEMINARS array below.

   Events are sorted automatically. Anything dated today or in the future
   shows under "Upcoming"; everything earlier moves to "Past".

   Each entry:
   {
     id:       "unique-string",
     date:     "2026-09-23",          // YYYY-MM-DD (required)
     time:     "16:00–17:15",         // free text
     location: "Campus Paris · Room 4201",
     mode:     "in-person",           // "in-person" | "online" | "hybrid"
     field:    "Macroeconomics",      // used for the filter chips
     title:    "Talk title",
     abstract: "One or two paragraphs…",
     speaker: {
       name:        "Jane Doe",
       affiliation: "MIT",
       website:     "https://example.edu/jane",   // "" to hide the link
       photo:       ""    // path/URL to a portrait, e.g. "assets/img/speakers/jane.jpg".
                          // Leave "" and a coloured initials avatar is generated automatically.
     },
     links: {            // all optional — omit or "" to hide a button
       paper:     "https://…",
       slides:    "https://…",
       recording: "https://…"
     }
   }
   ===================================================================== */

const SEMINARS = [
  /* ----------------------------- UPCOMING ----------------------------- */
  {
    id: "2026-06-24-okonkwo",
    date: "2026-06-24",
    time: "16:00–17:15",
    location: "Campus Paris · Room 4201",
    mode: "in-person",
    field: "Macroeconomics",
    title: "Fiscal Multipliers When Households Disagree About Inflation",
    abstract:
      "We study how heterogeneous inflation expectations reshape the transmission of fiscal policy. Using a HANK model disciplined by survey microdata, we show that disagreement amplifies the response of consumption to government spending at the zero lower bound, but dampens it once policy rates are free to move. We provide empirical support using a new panel of household expectations matched to local fiscal shocks, and discuss implications for the design of stimulus.",
    speaker: {
      name: "Amara Okonkwo",
      affiliation: "London School of Economics",
      website: "https://www.lse.ac.uk/economics",
      photo: ""
    },
    links: { paper: "https://example.org/papers/fiscal-multipliers.pdf" }
  },
  {
    id: "2026-07-01-laurent",
    date: "2026-07-01",
    time: "16:00–17:15",
    location: "Online · Zoom",
    mode: "online",
    field: "Economics of AI",
    title: "Generative AI and the Wage Structure: Early Evidence from Firm-Level Adoption",
    abstract:
      "Combining administrative matched employer–employee data with a measure of firm-level exposure to generative AI, we trace how adoption reallocates tasks within firms and how this maps into the wage distribution. We find compression at the middle of the distribution and a rising premium for workers who complement AI tools, with effects concentrated in the two years following adoption.",
    speaker: {
      name: "Étienne Laurent",
      affiliation: "Paris School of Economics",
      website: "https://www.parisschoolofeconomics.eu",
      photo: ""
    },
    links: {}
  },
  {
    id: "2026-09-23-bianchi",
    date: "2026-09-23",
    time: "16:00–17:15",
    location: "Campus Paris · Room 3105",
    mode: "hybrid",
    field: "Finance",
    title: "Climate Risk, Collateral, and the Geography of Credit",
    abstract:
      "Does physical climate risk travel through banks' balance sheets to firms far from the hazard? Using granular credit-register data, we show that lenders exposed to flood-prone collateral tighten credit broadly, propagating localized climate shocks across regions. We quantify the resulting misallocation and evaluate macroprudential responses.",
    speaker: {
      name: "Giulia Bianchi",
      affiliation: "Bocconi University",
      website: "https://www.unibocconi.eu",
      photo: ""
    },
    links: { paper: "https://example.org/papers/climate-collateral.pdf" }
  },
  {
    id: "2026-10-07-haddad",
    date: "2026-10-07",
    time: "16:00–17:15",
    location: "Campus Paris · Room 4201",
    mode: "in-person",
    field: "Trade",
    title: "Reshoring or Rerouting? Supply Chains After the Tariff Wars",
    abstract:
      "We use transaction-level customs data to ask whether recent tariff escalations led firms to bring production home or simply to reroute it through third countries. We document substantial rerouting, estimate its cost, and show how it blunts the intended protection while raising prices for downstream producers.",
    speaker: {
      name: "Nadia Haddad",
      affiliation: "Sciences Po",
      website: "https://www.sciencespo.fr/department-economics",
      photo: ""
    },
    links: {}
  },

  /* ------------------------------- PAST ------------------------------- */
  {
    id: "2026-06-10-novak",
    date: "2026-06-10",
    time: "16:00–17:15",
    location: "Campus Paris · Room 4201",
    mode: "in-person",
    field: "Labour",
    title: "Pay Transparency and the Gender Gap: Evidence from a National Reform",
    abstract:
      "Exploiting the staggered rollout of mandatory pay-transparency rules, we estimate effects on the gender pay gap, hiring, and wage compression. Transparency narrows the within-firm gap primarily by slowing men's wage growth, with limited effects on women's pay and small disemployment costs.",
    speaker: {
      name: "Petr Novák",
      affiliation: "CERGE-EI, Prague",
      website: "https://www.cerge-ei.cz",
      photo: ""
    },
    links: {
      paper: "https://example.org/papers/pay-transparency.pdf",
      slides: "https://example.org/slides/pay-transparency.pdf"
    }
  },
  {
    id: "2026-05-27-romero",
    date: "2026-05-27",
    time: "16:00–17:15",
    location: "Campus Madrid · Aula Magna",
    mode: "hybrid",
    field: "Development",
    title: "Mobile Money, Risk Sharing, and Rural Investment",
    abstract:
      "We evaluate a large-scale expansion of mobile-money agents and its effect on consumption smoothing and agricultural investment. Improved access to digital transfers strengthens informal risk-sharing networks and raises investment in inputs, particularly for households far from formal bank branches.",
    speaker: {
      name: "Sofía Romero",
      affiliation: "Universidad Carlos III de Madrid",
      website: "https://www.uc3m.es/economics",
      photo: ""
    },
    links: {
      paper: "https://example.org/papers/mobile-money.pdf",
      recording: "https://example.org/recordings/mobile-money"
    }
  },
  {
    id: "2026-05-13-keller",
    date: "2026-05-13",
    time: "16:00–17:15",
    location: "Campus Berlin · Room 2.14",
    mode: "in-person",
    field: "Macroeconomics",
    title: "The Term Structure of Inflation Expectations and Monetary Credibility",
    abstract:
      "We build a model linking the slope of the expected-inflation curve to central-bank credibility and test it across advanced economies. A steeper near-term curve predicts larger forecast errors and weaker policy traction, offering a real-time gauge of anchoring.",
    speaker: {
      name: "Hannah Keller",
      affiliation: "Humboldt-Universität zu Berlin",
      website: "https://www.wiwi.hu-berlin.de",
      photo: ""
    },
    links: { slides: "https://example.org/slides/term-structure.pdf" }
  },
  {
    id: "2026-04-29-tanaka",
    date: "2026-04-29",
    time: "16:00–17:15",
    location: "Online · Zoom",
    mode: "online",
    field: "Microeconomics",
    title: "Matching Markets with Aligned Preferences: Theory and an Application to School Choice",
    abstract:
      "We characterize stable matchings when agents share a common ranking component and study how much efficiency aligned preferences buy. An application to a city school-choice system shows sizeable welfare gains from a redesigned tie-breaking rule.",
    speaker: {
      name: "Ren Tanaka",
      affiliation: "Toulouse School of Economics",
      website: "https://www.tse-fr.eu",
      photo: ""
    },
    links: { paper: "https://example.org/papers/matching.pdf" }
  },
  {
    id: "2026-04-15-svensson",
    date: "2026-04-15",
    time: "16:00–17:15",
    location: "Campus Paris · Room 3105",
    mode: "in-person",
    field: "Environmental",
    title: "Carbon Pricing and Firm Innovation: A Patent-Level Analysis",
    abstract:
      "Using firm-level patent data matched to emissions, we estimate how carbon prices redirect innovation toward clean technologies. We find a robust elasticity of green patenting to the carbon price, with stronger responses among firms already close to the technological frontier.",
    speaker: {
      name: "Erik Svensson",
      affiliation: "Stockholm School of Economics",
      website: "https://www.hhs.se",
      photo: ""
    },
    links: {
      paper: "https://example.org/papers/carbon-innovation.pdf",
      recording: "https://example.org/recordings/carbon-innovation"
    }
  },
  {
    id: "2026-03-25-costa",
    date: "2026-03-25",
    time: "16:00–17:15",
    location: "Campus Turin · Sala Conferenze",
    mode: "in-person",
    field: "Finance",
    title: "Retail Investors, Social Media, and Price Discovery",
    abstract:
      "We measure how coordinated retail attention on social platforms affects price discovery and volatility. Attention spikes temporarily improve liquidity but degrade the information content of prices, with effects reversing over the following weeks.",
    speaker: {
      name: "Marco Costa",
      affiliation: "Collegio Carlo Alberto, Turin",
      website: "https://www.carloalberto.org",
      photo: ""
    },
    links: { slides: "https://example.org/slides/retail-investors.pdf" }
  }
];

/* Expose for app.js (works whether or not modules are used) */
window.SEMINARS = SEMINARS;
