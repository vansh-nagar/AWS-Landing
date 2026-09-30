/**
 * Copy for the identity strip, About and Featured event sections.
 * Edit here; the section components only render this data.
 */

/**
 * Pixel icon shapes from the official AWS SBG kit (public/brand).
 * NOTE: the kit's file names don't match their contents (e.g. `bolt_blue.svg`
 * is an amber bolt, `trophy_white.svg` is a wrench). These paths were picked
 * by looking at the rendered shape. Icons are drawn as a CSS mask, so only the
 * shape matters; the colour comes from `text-*`.
 */
export const PIXEL_ICONS = {
  bolt: { src: "/brand/icons/bolt_blue.svg", ratio: 2580 / 3870 },
  wrench: { src: "/brand/icons/wrench_mint.svg", ratio: 5590 / 2580 },
  teams: { src: "/brand/icons/teams_magenta.svg", ratio: 6880 / 3870 },
  ladder: { src: "/brand/icons/ladder_mint.svg", ratio: 2580 / 3870 },
  program: { src: "/brand/program-icon/white.svg", ratio: 1 },
} as const;

export type PixelIconName = keyof typeof PIXEL_ICONS;

/** Tailwind text colour classes for the brand accents (kept literal for the JIT). */
export const BRAND_TEXT = {
  amber: "text-brand-amber",
  mint: "text-brand-mint",
  magenta: "text-brand-magenta",
  blue: "text-brand-blue",
  purple: "text-brand-purple",
} as const;

/** Same accents, applied when the parent `.group` is hovered. */
export const BRAND_GROUP_HOVER_TEXT = {
  amber: "group-hover:text-brand-amber",
  mint: "group-hover:text-brand-mint",
  magenta: "group-hover:text-brand-magenta",
  blue: "group-hover:text-brand-blue",
  purple: "group-hover:text-brand-purple",
} as const;

export type BrandColor = keyof typeof BRAND_TEXT;

/* ------------------------------------------------------------------------ */
/* 3. Identity strip                                                         */
/* ------------------------------------------------------------------------ */

export type IdentityItem = {
  title: string;
  description: string;
  icon: PixelIconName;
  /** Icon colour on hover (icons are black at rest). */
  color: BrandColor;
};

export const identityItems: IdentityItem[] = [
  {
    title: "Cloud",
    description: "Learn AWS and modern cloud technologies",
    icon: "bolt",
    color: "amber",
  },
  {
    title: "Build",
    description: "Turn concepts into working projects",
    icon: "wrench",
    color: "blue",
  },
  {
    title: "Community",
    description: "Meet builders from BIT Jaipur and beyond",
    icon: "teams",
    color: "magenta",
  },
  {
    title: "Grow",
    description: "Develop technical and professional skills",
    icon: "ladder",
    color: "mint",
  },
];

/* ------------------------------------------------------------------------ */
/* 4. About                                                                  */
/* ------------------------------------------------------------------------ */

export const about = {
  title: "Build together. Grow together.",
  body: [
    "AWS Student Builder Group at BIT Jaipur is a student-led technology community focused on learning, building, and growing together.",
    "Through technical sessions, hands-on workshops, community events, project-building experiences, and career-focused activities, we help students take their first steps into cloud computing and continue growing as builders.",
  ],
  /** The terminal window next to the headline (typed in when scrolled into view). */
  terminal: {
    title: "What we do",
    command: "ls ./activities",
    lines: [
      { label: "Technical sessions", tag: "LEARN" },
      { label: "Hands-on workshops", tag: "BUILD" },
      { label: "Community events", tag: "CONNECT" },
      { label: "Project-building experiences", tag: "BUILD" },
      { label: "Career-focused activities", tag: "GROW" },
    ],
    footer: "PRIOR AWS EXPERIENCE NEEDED: NONE",
  },
  quote: {
    text: "Every student belongs here.",
    body: "Whether you're opening the AWS Console for the first time or already shipping projects, there's a place for you in the community.",
    author: "AWS SBG BIT Jaipur",
    role: "Open to every experience level",
  },
};

/* ------------------------------------------------------------------------ */
/* 5. Featured event + upcoming events                                       */
/* ------------------------------------------------------------------------ */

// TODO: replace with the group's Meetup URL (and per-event Meetup links).
export const MEETUP_URL = "#";

export type EventMeta = { label: string; value: string };

export const featuredEvent = {
  heading: "Up Next",
  note: "Official events are published on Meetup",
  tag: "Induction",
  status: "Coming soon",
  title: "AWS Student Builder Group Induction 2026",
  subtitle: "Coming Soon · BIT Jaipur",
  description:
    "Meet the community, discover what AWS Student Builder Groups are about, learn what's coming this year, and connect with fellow builders across campus.",
  meta: [
    { label: "Location", value: "BIT Jaipur" },
    { label: "Date", value: "TBA" },
    { label: "Time", value: "TBA" },
    { label: "Open to", value: "BIT Jaipur students" },
  ] satisfies EventMeta[],
  register: { words: ["Register", "on Meetup"] as [string, string], href: MEETUP_URL },
  // TODO: link to the event's Meetup page once it is published.
  view: { text: "View event", href: MEETUP_URL },
};

export type UpcomingEvent = { title: string; date: string; location: string; href: string };

export const upcomingEvents = {
  heading: "Upcoming Events",
  href: MEETUP_URL,
  items: [
    { title: "AWS SBG Induction", date: "Date TBA", location: "BIT Jaipur", href: MEETUP_URL },
    { title: "Getting Started with AWS", date: "Date TBA", location: "BIT Jaipur", href: MEETUP_URL },
    {
      title: "Build Your First Cloud Application",
      date: "Date TBA",
      location: "BIT Jaipur",
      href: MEETUP_URL,
    },
  ] satisfies UpcomingEvent[],
};
