/**
 * Copy + data for the site chrome: navbar (section 1), final CTA (section 20)
 * and footer (section 21). Edit text here; the components only lay it out.
 */

export type ChromeLink = {
  label: string;
  href: string;
  /** Opens in a new tab (external sites). */
  external?: boolean;
};

export type NavLink = ChromeLink & {
  /** Section id this link points at; drives the active highlight. */
  sectionId?: string;
  /** Orange pulse dot after the label (the reference's "Pricing" dot). */
  pulse?: boolean;
};

/* ------------------------------------------------------------------------ */
/* Shared links                                                              */
/* ------------------------------------------------------------------------ */

export const LINKS = {
  builderCenter: "https://builder.aws.com", // TODO: swap for the group's unique Builder Center sign-up link.
  meetup: "#", // TODO: group Meetup URL.
  instagram: "https://www.instagram.com/aws.sbg.bitj/",
  linkedin: "#", // TODO: LinkedIn page URL.
} as const;

/* ------------------------------------------------------------------------ */
/* 1. Navbar                                                                 */
/* ------------------------------------------------------------------------ */

export const nav = {
  brand: "AWS Student Builder Group at BIT Jaipur",
  links: [
    { label: "Home", href: "/" },
    { label: "About", href: "#about", sectionId: "about" },
    { label: "Events", href: "#events", sectionId: "events", pulse: true },
    { label: "Community", href: "#community", sectionId: "community" },
    { label: "Team", href: "#team", sectionId: "team" },
    { label: "Resources", href: "#resources", sectionId: "resources" },
    { label: "Contact", href: "#contact", sectionId: "contact" },
  ] satisfies NavLink[],
  /** Scrolling strip under the links. */
  announcement: "Induction 2026 · Coming soon · BIT Jaipur",
  primaryCta: { label: "Join the Community", href: "#community" },
  secondaryCta: { label: "Upcoming Events", href: "#events" },
};

/* ------------------------------------------------------------------------ */
/* 20. Final CTA                                                             */
/* ------------------------------------------------------------------------ */

export const finalCta = {
  /** Terminal window title bar. */
  windowTitle: "aws-sbg-bit-jaipur",
  headline: "Ready to build?",
  body: "The next project, skill, collaborator or opportunity might start with one event.",
  /** Split pill: two words joined by the notched connector. */
  primaryCta: { words: ["Join the", "Community"] as [string, string], href: "#community" },
  secondaryCta: { label: "See Upcoming Events", href: "#events" },
  signature: "AWS Student Builder Group at BIT Jaipur",
};

/* ------------------------------------------------------------------------ */
/* 21. Footer                                                                */
/* ------------------------------------------------------------------------ */

export const footer = {
  brand: "AWS Student Builder Group at BIT Jaipur",
  tagline:
    "A student-led community helping students learn, build and connect through cloud technology.",
  columns: [
    {
      title: "Explore",
      links: [
        { label: "Events", href: "#events" },
        { label: "Resources", href: "#resources" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Meetup", href: LINKS.meetup, external: true },
        { label: "AWS Builder Center", href: LINKS.builderCenter, external: true },
        { label: "Instagram", href: LINKS.instagram, external: true },
        { label: "LinkedIn", href: LINKS.linkedin, external: true },
      ],
    },
  ] satisfies { title: string; links: ChromeLink[] }[],
  contact: {
    title: "Contact",
    instagram: { handle: "@aws.sbg.bitj", href: LINKS.instagram },
    /** TODO: campus email. Leave null to hide the line. */
    email: null as string | null,
  },
  copyright: "© 2026 AWS Student Builder Group at BIT Jaipur",
  /** Phrases spelled by the ASCII field behind the footer. */
  backgroundPhrases: ["AWS Student Builder Group", "BIT Jaipur", "Learn", "Build", "Connect"],
  /** REQUIRED by the program: keep verbatim. */
  disclaimer:
    "AWS Student Builder Group at BIT Jaipur is a student-led community participating in the AWS Student Builder Groups program. It is not an AWS employee group.",
};

/* ------------------------------------------------------------------------ */
/* Final CTA ASCII art                                                       */
/* ------------------------------------------------------------------------ */

/*
 * "Ready to build?" in the figlet font "Big Money-ne" (the font the reference
 * callout uses). Generated, not hand-drawn: if the headline changes,
 * regenerate with `figlet -f "Big Money-ne" "<text>"` (npm `figlet`), keep
 * two blank rows between lines, and right-pad every row to the same width.
 */
export const FINAL_CTA_ASCII = {
  /** 1 line, 128 columns (lg and up). */
  wide: { cols: 128, lines: [
    " /$$$$$$$                            /$$                   /$$                     /$$                 /$$ /$$       /$$  /$$$$ ",
    "| $$__  $$                          | $$                  | $$                    | $$                |__/| $$      | $$ /$$  $$",
    "| $$  \\ $$  /$$$$$$   /$$$$$$   /$$$$$$$ /$$   /$$       /$$$$$$    /$$$$$$       | $$$$$$$  /$$   /$$ /$$| $$  /$$$$$$$|__/\\ $$",
    "| $$$$$$$/ /$$__  $$ |____  $$ /$$__  $$| $$  | $$      |_  $$_/   /$$__  $$      | $$__  $$| $$  | $$| $$| $$ /$$__  $$    /$$/",
    "| $$__  $$| $$$$$$$$  /$$$$$$$| $$  | $$| $$  | $$        | $$    | $$  \\ $$      | $$  \\ $$| $$  | $$| $$| $$| $$  | $$   /$$/ ",
    "| $$  \\ $$| $$_____/ /$$__  $$| $$  | $$| $$  | $$        | $$ /$$| $$  | $$      | $$  | $$| $$  | $$| $$| $$| $$  | $$  |__/  ",
    "| $$  | $$|  $$$$$$$|  $$$$$$$|  $$$$$$$|  $$$$$$$        |  $$$$/|  $$$$$$/      | $$$$$$$/|  $$$$$$/| $$| $$|  $$$$$$$   /$$  ",
    "|__/  |__/ \\_______/ \\_______/ \\_______/ \\____  $$         \\___/   \\______/       |_______/  \\______/ |__/|__/ \\_______/  |__/  ",
    "                                         /$$  | $$                                                                              ",
    "                                        |  $$$$$$/                                                                              ",
    "                                         \\______/                                                                               ",
  ] },
  /** 2 lines, 72 columns (below lg). */
  narrow: { cols: 72, lines: [
    " /$$$$$$$                            /$$                                ",
    "| $$__  $$                          | $$                                ",
    "| $$  \\ $$  /$$$$$$   /$$$$$$   /$$$$$$$ /$$   /$$                      ",
    "| $$$$$$$/ /$$__  $$ |____  $$ /$$__  $$| $$  | $$                      ",
    "| $$__  $$| $$$$$$$$  /$$$$$$$| $$  | $$| $$  | $$                      ",
    "| $$  \\ $$| $$_____/ /$$__  $$| $$  | $$| $$  | $$                      ",
    "| $$  | $$|  $$$$$$$|  $$$$$$$|  $$$$$$$|  $$$$$$$                      ",
    "|__/  |__/ \\_______/ \\_______/ \\_______/ \\____  $$                      ",
    "                                         /$$  | $$                      ",
    "                                        |  $$$$$$/                      ",
    "                                         \\______/                       ",
    "                                                                        ",
    "                                                                        ",
    "   /$$                     /$$                 /$$ /$$       /$$  /$$$$ ",
    "  | $$                    | $$                |__/| $$      | $$ /$$  $$",
    " /$$$$$$    /$$$$$$       | $$$$$$$  /$$   /$$ /$$| $$  /$$$$$$$|__/\\ $$",
    "|_  $$_/   /$$__  $$      | $$__  $$| $$  | $$| $$| $$ /$$__  $$    /$$/",
    "  | $$    | $$  \\ $$      | $$  \\ $$| $$  | $$| $$| $$| $$  | $$   /$$/ ",
    "  | $$ /$$| $$  | $$      | $$  | $$| $$  | $$| $$| $$| $$  | $$  |__/  ",
    "  |  $$$$/|  $$$$$$/      | $$$$$$$/|  $$$$$$/| $$| $$|  $$$$$$$   /$$  ",
    "   \\___/   \\______/       |_______/  \\______/ |__/|__/ \\_______/  |__/  ",
  ] },
} as const;
