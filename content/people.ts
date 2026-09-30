// Copy + data for sections 10–14: AWS Builder Center, Core team, Faculty
// advisor, Founding community, Community numbers. Edit here, not in the
// components.

export type Link = { text: string; href: string };

/* ------------------------------------------------------------------------ */
/* 10. AWS Builder Center                                                    */
/* ------------------------------------------------------------------------ */

export const builderCenter = {
  title: "Keep building beyond the event.",
  body: "AWS Builder Center is where builders can continue learning, discover technical content, participate in the community, and share what they're building.",
  // TODO: replace with the group's unique Builder Center sign-up link.
  cta: { words: ["Explore", "AWS Builder Center"] as [string, string], href: "https://builder.aws.com" },
  terminal: {
    title: "builder-center",
    prompt: "~/aws-sbg-bitj",
    command: "open builder-center",
    link: "→ builder.aws.com",
    output: [
      "Continue learning",
      "Discover technical content",
      "Participate in the community",
      "Share what you're building",
    ],
    qrCommand: "scan qr",
    /** Swap for the real QR image (e.g. "/brand/builder-center-qr.svg") when the sign-up link exists. */
    qrSrc: null as string | null,
    qrPlaceholder: "QR · Coming soon",
  },
};

/* ------------------------------------------------------------------------ */
/* 11. Core team + 12. Faculty advisor                                       */
/* ------------------------------------------------------------------------ */

export type Person = {
  name: string;
  role: string;
  line: string;
  /**
   * Portrait photo (same-origin path, e.g. "/team/yashvardhan.jpg"). It gets
   * the same ASCII treatment as the placeholder; hover reveals the photo.
   */
  photo?: string;
  /** Initials drawn in the ASCII placeholder while there is no photo. */
  initials?: string;
  /** LinkedIn profile URL. Omit to hide the icon. */
  linkedin?: string;
  /** Seat not filled yet: shows a "To be announced" tag. */
  placeholder?: boolean;
};

export const coreTeam = {
  title: "Meet the builders behind the community",
  intro:
    "AWS Student Builder Group at BIT Jaipur is led by students who organise events, create technical experiences, build the community and help other students get involved.",
  placeholderTag: "To be announced",
  members: [
    {
      name: "Yashvardhan Thanvi",
      role: "Student Builder Group Leader",
      line: "Leading AWS Student Builder Group at BIT Jaipur and helping build its cloud and developer community.",
      initials: "YT",
      linkedin: "#", // TODO: Yashvardhan's LinkedIn URL
    },
    // TODO: fill in the core team as seats are confirmed.
    {
      name: "[Name]",
      role: "Technical Lead",
      line: "Shapes the technical sessions and hands-on workshops.",
      placeholder: true,
    },
    {
      name: "[Name]",
      role: "Events & Operations",
      line: "Plans and runs community events on campus.",
      placeholder: true,
    },
    {
      name: "[Name]",
      role: "Community & Marketing",
      line: "Grows the community and keeps everyone in the loop.",
      placeholder: true,
    },
    {
      name: "[Name]",
      role: "Design / Content / Outreach",
      line: "Makes what we share look good and reach further.",
      placeholder: true,
    },
    {
      name: "[Name]",
      role: "Developer Relations / Projects",
      line: "Helps members start, ship and show their projects.",
      placeholder: true,
    },
  ] satisfies Person[] as Person[],
};

export const facultyAdvisor = {
  title: "Faculty Advisor",
  // TODO: faculty advisor's name, designation and photo.
  person: {
    name: "Prof. [Name]",
    role: "[Department / Designation]",
    line: "Supporting the AWS Student Builder Group community at BIT Jaipur.",
    placeholder: true,
  } satisfies Person as Person,
};

/* ------------------------------------------------------------------------ */
/* 13. Founding community                                                    */
/* ------------------------------------------------------------------------ */

export const founding = {
  title: "Be part of\nwhere it begins.",
  body: "We're building the first chapter of AWS Student Builder Group at BIT Jaipur. Join early, help shape the community, attend our first events, and become part of its story from day one.",
  stackLabel: "Founding members · first 90 days",
  card: {
    tag: "Founding member",
    status: "Open now",
    /** Big rolling figure + its label. */
    figure: "90",
    figureLabel: "Days to join as a founding member",
    points: [
      "Join early",
      "Help shape the community",
      "Attend our first events",
      "Become part of its story from day one",
    ],
  },
  cta: { words: ["Become a", "Founding Member"] as [string, string], href: "/#community" },
};

/* ------------------------------------------------------------------------ */
/* 14. Community numbers                                                     */
/* ------------------------------------------------------------------------ */

export type CommunityStat = {
  /**
   * Shown in headline type. Digits roll in like an odometer ("2026", "120+");
   * anything else is shown as-is.
   */
  value: string;
  label: string;
};

export const communityStats = {
  title: "The community, at a glance",
  eyebrow: "Launch edition · 2026",
  // Only real numbers. Later: members / events / learning hours / projects.
  items: [
    { value: "2026", label: "Founded" },
    { value: "BIT Jaipur", label: "Campus" },
    { value: "AWS", label: "Cloud Ecosystem" },
    { value: "Everyone", label: "Welcome" },
  ] satisfies CommunityStat[] as CommunityStat[],
};
