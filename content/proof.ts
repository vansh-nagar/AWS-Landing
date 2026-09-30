/**
 * Copy + data for sections 15-19 (past events, gallery, builder showcase,
 * learning resources, FAQ). Edit here; the section components only render it.
 *
 * Launch state: `pastEvents`, `gallery` and `showcaseProjects` are empty on
 * purpose. Past events + gallery render nothing until they have entries;
 * the showcase shows an honest "your project here" empty state. Only add
 * real events, real campus photos and real projects (no placeholders).
 */

/* ------------------------------------------------------------------------ */
/* Shared types                                                             */
/* ------------------------------------------------------------------------ */

export type ProofImage = {
  /** Path under /public (e.g. "/events/induction-2026.jpg") or a full URL. */
  src: string;
  alt: string;
  /** Intrinsic size; drives the aspect ratio of the frame. */
  width: number;
  height: number;
};

/* ------------------------------------------------------------------------ */
/* 15. Past events                                                          */
/* ------------------------------------------------------------------------ */

export type PastEvent = {
  title: string;
  /** Display date, e.g. "September 2026". */
  date: string;
  /** Real attendance only, e.g. "100+ students". Leave out if unknown. */
  attendance?: string;
  /** Two-line recap. */
  recap: string;
  image?: ProofImage;
  /** Recap / Meetup / photo album link. */
  href?: string;
};

export const pastEventsSection = {
  id: "past-events",
  backgroundPhrases: ["We've been building", "Workshop", "Build night", "Community day", "BIT Jaipur"],
  title: "We've been building",
  intro:
    "Sessions, workshops and build nights the community has already run at BIT Jaipur.",
};

// Example entry for when the first event has happened (not real yet):
// {
//   title: "AWS SBG BIT Jaipur Induction 2026",
//   date: "September 2026",
//   attendance: "100+ students",
//   recap:
//     "We introduced the community, explored what's ahead and brought together BIT Jaipur's first generation of AWS Student Builders.",
//   image: { src: "/events/induction-2026.jpg", alt: "…", width: 1920, height: 1080 },
// },
export const pastEvents: PastEvent[] = [];

/* ------------------------------------------------------------------------ */
/* 16. Gallery                                                              */
/* ------------------------------------------------------------------------ */

export type GalleryPhoto = ProofImage & {
  /** Short mono caption, e.g. "Workshop", "Speaker session", "Demo day". */
  caption: string;
};

export const gallerySection = {
  id: "gallery",
  title: "Life at AWS SBG BIT Jaipur",
  intro:
    "Workshops, speaker sessions, late-night coding and demos. Campus photos from our own events.",
};

/** Campus photos only. Empty until the first event. */
export const gallery: GalleryPhoto[] = [];

/* ------------------------------------------------------------------------ */
/* 17. Builder showcase                                                     */
/* ------------------------------------------------------------------------ */

export type ShowcaseProject = {
  name: string;
  /** Builder or team name(s). */
  builder: string;
  /** AWS services / tech, e.g. ["AWS Lambda", "Bedrock", "DynamoDB"]. */
  stack: string[];
  /** One line. */
  description: string;
  image?: ProofImage;
  github?: string;
  demo?: string;
};

export const showcaseSection = {
  id: "showcase",
  title: "Built by our community",
  /** Words spelled by the ASCII field behind the section. */
  backgroundPhrases: [
    "Built by our community",
    "First deploy",
    "Ship it",
    "Build night",
    "Open source",
    "Lambda",
    "DynamoDB",
    "Bedrock",
  ],
  intro:
    "Projects shipped by students at BIT Jaipur, from first deploys to full apps. Every one here was built by a member of the community.",
  empty: {
    title: "Your project here",
    note: "Submit after your first build night",
    stepsTitle: "How to get featured",
    steps: [
      "Build something at a workshop or build night",
      "Push the code to a public GitHub repo",
      "Share it with the core team at an event",
    ],
  },
  labels: {
    github: "GitHub",
    demo: "Demo",
  },
};

export const showcaseProjects: ShowcaseProject[] = [];

/* ------------------------------------------------------------------------ */
/* 18. Learning resources                                                   */
/* ------------------------------------------------------------------------ */

export type LearningResource = {
  name: string;
  description: string;
  href: string;
  /** Optional small tag, shown with the accent dot. Use at most one. */
  tag?: string;
};

export const resourcesSection = {
  id: "resources",
  title: "Start learning today",
  caption: "Five public resources · Start anytime",
  panelTag: "Public resources",
  panelNote: "Links open the official AWS sites in a new tab.",
};

export const resources: LearningResource[] = [
  {
    name: "AWS Skill Builder",
    description: "Learn AWS technologies at your own pace.",
    href: "https://skillbuilder.aws",
  },
  {
    name: "AWS Builder Center",
    description: "Explore technical content and the builder community.",
    // TODO: swap for the group's unique Builder Center sign-up link.
    href: "https://builder.aws.com",
  },
  {
    name: "AWS Workshops",
    description: "Follow guided hands-on AWS projects.",
    href: "https://workshops.aws",
  },
  {
    name: "AWS Educate",
    description:
      "Resources designed for students beginning their cloud journey.",
    href: "https://aws.amazon.com/education/awseducate/",
    tag: "For students",
  },
  {
    name: "AWS Free Tier",
    description: "Experiment with AWS services.",
    href: "https://aws.amazon.com/free/",
  },
];

/* ------------------------------------------------------------------------ */
/* 19. FAQ                                                                  */
/* ------------------------------------------------------------------------ */

export type FaqItem = {
  /** Stable key (used for the open state). */
  key: string;
  question: string;
  /** One string per paragraph. */
  answer: string[];
};

export const faqSection = {
  id: "faq",
  backgroundPhrases: [
    "Before you join",
    "Ask anything",
    "Everyone welcome",
    "No experience needed",
    "Student-led",
    "BIT Jaipur",
  ],
  title: "Before you join",
  cta: {
    words: ["Join", "the community"] as [string, string],
    href: "/#community",
  },
};

export const faqItems: FaqItem[] = [
  {
    key: "experience",
    question: "Do I need prior AWS experience?",
    answer: [
      "No. The community welcomes complete beginners as well as experienced builders.",
    ],
  },
  {
    key: "who",
    question: "Who can join?",
    answer: [
      "Students of BIT Jaipur interested in cloud computing, software development, AI, technology or simply learning something new.",
    ],
  },
  {
    key: "cs-only",
    question: "Is AWS Student Builder Group only for CS students?",
    answer: [
      "No. Students from different disciplines and experience levels are welcome.",
    ],
  },
  {
    key: "free",
    question: "Are events free?",
    // TODO: replace with the actual campus policy on event fees.
    answer: [
      "Each event lists everything you need to know, including any cost, on its Meetup page before it happens.",
    ],
  },
  {
    key: "announced",
    question: "Where are events announced?",
    answer: [
      "Official events will be published through our Meetup community and shared through our social channels.",
    ],
  },
  {
    key: "how-to-join",
    question: "How do I join?",
    answer: [
      "Follow the community, join Builder Center and register for upcoming events.",
    ],
  },
  {
    key: "contribute",
    question: "Can I contribute without being on the Core Team?",
    answer: [
      "Yes. Members can attend events, contribute ideas, volunteer, build projects and support the community.",
    ],
  },
];
