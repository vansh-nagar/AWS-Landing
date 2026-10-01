/*
 * Copy + data for sections 6–9: What happens here, Builder journey,
 * Join the community, Why join. Edit freely — the components only read this.
 */

/** Pixel icon shapes from the official kit (public/brand/icons). */
export type BrandIconName =
  | "bolt"
  | "clock"
  | "double-bracket-smile"
  | "drop"
  | "key"
  | "ladder"
  | "single-bracket-smile"
  | "speaker"
  | "teams"
  | "trophy"
  | "wrench"
  | "program";

export type BrandIconColor =
  | "amber"
  | "blue"
  | "grey-850"
  | "magenta"
  | "mint"
  | "purple"
  | "white";

export type BrandIcon = { name: BrandIconName; color: BrandIconColor };

/*
 * NOTE: the kit's file names don't match their contents (e.g.
 * wrench_amber.svg is a dark trophy, bolt_purple.svg is a clock). So each
 * shape points at ONE file known to contain it, used only as a mask; the
 * colour comes from the brand token instead. Verified against a render of
 * every file in public/brand/icons.
 */
export const BRAND_ICON_SHAPES: Record<
  BrandIconName,
  { src: string; width: number; height: number }
> = {
  bolt: { src: "/brand/icons/bolt_blue.svg", width: 2580, height: 3870 },
  clock: { src: "/brand/icons/bolt_purple.svg", width: 3010, height: 3010 },
  "double-bracket-smile": {
    src: "/brand/icons/double-bracket-smile_blue.svg",
    width: 5160,
    height: 3012,
  },
  drop: { src: "/brand/icons/drop_magenta.svg", width: 3010, height: 4300 },
  key: { src: "/brand/icons/key_blue.svg", width: 4300, height: 2150 },
  ladder: { src: "/brand/icons/key_mint.svg", width: 2580, height: 3870 },
  "single-bracket-smile": {
    src: "/brand/icons/single-bracket-smile_amber.svg",
    width: 3440,
    height: 3010,
  },
  speaker: { src: "/brand/icons/speaker_amber.svg", width: 5592, height: 3440 },
  teams: { src: "/brand/icons/teams_magenta.svg", width: 6880, height: 3870 },
  trophy: { src: "/brand/icons/trophy_amber.svg", width: 3870, height: 3870 },
  wrench: { src: "/brand/icons/wrench_mint.svg", width: 5590, height: 2580 },
  program: { src: "/brand/program-icon/white.svg", width: 3000, height: 3000 },
};

export type LinkAction = { label: string; href: string };

/* ------------------------------------------------------------------------ */
/* 6. What happens here                                                      */
/* ------------------------------------------------------------------------ */

export const whatWeDo = {
  id: "what-we-do",
  eyebrow: "What happens here",
  title: "More than talks.\nWe build.",
  intro:
    "Hands-on sessions where you learn cloud by using it. Whether you are opening the AWS Console for the first time or already shipping projects, every format is built around doing, not just watching.",
  /** Words drifting in the ASCII field behind the section. */
  backgroundPhrases: [
    "LEARN",
    "BUILD",
    "CONNECT",
    "HANDS-ON WORKSHOPS",
    "BUILD NIGHTS",
    "LEARNING SESSIONS",
    "CLOUD CHALLENGES",
    "PROJECT SHOWCASES",
    "COMMUNITY DAYS",
    "SERVERLESS",
    "DATABASES",
    "SECURITY",
    "AI ON AWS",
    "CERTIFICATION PATHS",
    "FIND TEAMMATES",
    "BIT JAIPUR",
    "STUDENT BUILDERS",
  ],
  items: [
    {
      title: "Hands-on workshops",
      text: "Build real applications and experiment with AWS services instead of only watching presentations.",
      icon: { name: "wrench", color: "amber" },
    },
    {
      title: "Interactive learning sessions",
      text: "Understand cloud, AI, serverless computing, databases, security and other AWS technologies.",
      icon: { name: "bolt", color: "blue" },
    },
    {
      title: "Certification & career sessions",
      text: "Learn about AWS learning paths, certification preparation, cloud careers and developer opportunities.",
      icon: { name: "ladder", color: "mint" },
    },
    {
      title: "Networking & community events",
      text: "Meet builders, collaborate on ideas, find teammates and become part of the wider AWS student community.",
      icon: { name: "teams", color: "magenta" },
    },
  ] satisfies { title: string; text: string; icon: BrandIcon }[],
  laterLabel: "Later formats",
  later: [
    "Hackathons & build nights",
    "Project showcases",
    "Cloud challenges",
    "Community days",
  ],
};

/* ------------------------------------------------------------------------ */
/* 7. Builder journey                                                        */
/* ------------------------------------------------------------------------ */

export const builderJourney = {
  id: "journey",
  eyebrow: "Builder journey",
  title: "Start anywhere.\nKeep building.",
  body: "You don't need prior AWS experience to begin. Start by learning the fundamentals, join a workshop, build something, share what you learned, and grow alongside the community.",
  steps: [
    {
      title: "Discover",
      text: "Find the community and see what builders on campus are working on.",
      icon: { name: "key", color: "amber" },
    },
    {
      title: "Learn",
      text: "Pick up the cloud fundamentals at a session or at your own pace.",
      icon: { name: "bolt", color: "blue" },
    },
    {
      title: "Build",
      text: "Join a workshop and turn what you learned into something that runs.",
      icon: { name: "wrench", color: "mint" },
    },
    {
      title: "Share",
      text: "Show what you made and what you learned along the way.",
      icon: { name: "speaker", color: "magenta" },
    },
    {
      title: "Connect",
      text: "Meet teammates, collaborators and builders beyond BIT Jaipur.",
      icon: { name: "teams", color: "purple" },
    },
    {
      title: "Grow",
      text: "Keep learning, take on bigger projects and help the next builder start.",
      icon: { name: "ladder", color: "white" },
    },
  ] satisfies { title: string; text: string; icon: BrandIcon }[],
};

/* ------------------------------------------------------------------------ */
/* 8. Join the community                                                     */
/* ------------------------------------------------------------------------ */

export const joinCommunity = {
  id: "community",
  eyebrow: "Join the community",
  tag: "Open to BIT Jaipur students",
  title: "Your cloud journey doesn't have to be a solo one.",
  body: "Join students from BIT Jaipur who are exploring AWS, cloud computing, AI, development and emerging technologies together.",
  backgroundPhrases: [
    "LEARN TOGETHER",
    "BUILD TOGETHER",
    "GROW TOGETHER",
    "AWS STUDENT BUILDER GROUP",
    "BIT JAIPUR",
    "EVERY STUDENT BELONGS HERE",
    "NO PRIOR AWS EXPERIENCE NEEDED",
    "FIND YOUR TEAM",
  ],
  /** Split two-part primary button: [left, right]. */
  primary: {
    words: ["Join", "Builder Center"] as [string, string],
    label: "Join AWS Builder Center",
    // TODO: swap for the group's unique Builder Center sign-up link.
    href: "https://builder.aws.com",
  },
  secondary: [
    { label: "Follow our Meetup", href: "https://www.meetup.com/aws-sbg-at-birla-inst-of-technology-mesra-jaipur-campus/" },
    { label: "Join the campus community", href: "https://chat.whatsapp.com/HfnsHmEsdbxHIwMUWDealo" },
  ] satisfies LinkAction[],
  signature: {
    name: "AWS Student Builder Group",
    place: "at BIT Jaipur · student-led",
  },
};

/* ------------------------------------------------------------------------ */
/* 9. Why join                                                               */
/* ------------------------------------------------------------------------ */

export const whyJoin = {
  id: "why-join",
  title: "Why join?",
  aside: "No prior AWS experience needed",
  cards: [
    {
      title: "Learn AWS",
      text: "Get introduced to cloud concepts and AWS technologies through practical learning.",
      icon: { name: "bolt", color: "blue" },
    },
    {
      title: "Build Projects",
      text: "Go beyond theory by building and experimenting.",
      icon: { name: "wrench", color: "mint" },
    },
    {
      title: "Meet Builders",
      text: "Connect with developers, students and technology enthusiasts.",
      icon: { name: "teams", color: "magenta" },
    },
    {
      title: "Explore Careers",
      text: "Discover cloud careers, certifications and developer pathways.",
      icon: { name: "ladder", color: "amber" },
    },
    {
      title: "Share Your Work",
      text: "Showcase projects, ideas and things you learn.",
      icon: { name: "speaker", color: "purple" },
    },
    {
      title: "Be Part of Something Global",
      text: "Connect your campus community with the wider AWS Builder community.",
      icon: { name: "double-bracket-smile", color: "white" },
    },
  ] satisfies { title: string; text: string; icon: BrandIcon }[],
  membersLabel: "Every member can",
  members: [
    "Attend events",
    "Contribute ideas",
    "Volunteer",
    "Build projects",
    "Support the community",
  ],
  footnote:
    "Open to students across disciplines and experience levels. You don't need to be on the core team to shape what happens here.",
};
