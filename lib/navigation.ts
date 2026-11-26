/**
 * Coordinator sidebar. Spec: docs/spec/navigation.md — if this file and the
 * spec disagree, the spec wins.
 */

export interface NavItem {
  href: string;
  label: string;
  /** One line shown on the page until it's built. */
  purpose: string;
  built?: boolean;
}

/** The sidebar's three lists, switched with the toggle at the top (D15). */
export type NavGroup = "flowstate" | "persona" | "elements";

export const NAV_GROUPS: { id: NavGroup; label: string }[] = [
  { id: "flowstate", label: "Flowstate" },
  { id: "persona", label: "Persona" },
  { id: "elements", label: "Elements" },
];

export interface NavSection {
  title: string;
  /** Which list it appears in. Omitted = pinned below every list (Account). */
  group?: NavGroup;
  icon: string; // SVG path, 24×24
  /** Section with a single page (e.g. Watchboard) has no items. */
  href?: string;
  purpose?: string;
  /** Single-page section with a real page. */
  built?: boolean;
  adminOnly?: boolean;
  items?: NavItem[];
}

export const NAVIGATION: NavSection[] = [
  {
    title: "Workforce",
    group: "flowstate",
    icon: "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8",
    items: [
      { href: "/workforce/onboarding", label: "Onboarding", purpose: "Bring new carers in: application, checks and ready to work.", built: true },
      { href: "/workforce/directory", label: "Directory", purpose: "Everyone: carers, care receivers, coordinators and key persons.", built: true },
      { href: "/workforce/teams", label: "Teams", purpose: "The care team around each Package: a care receiver or a care home.", built: true },
    ],
  },
  {
    title: "Shifts",
    group: "flowstate",
    icon: "M8 2v3M16 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
    items: [
      { href: "/shifts/rotas", label: "Rotas", purpose: "The weekly rota and repeating patterns.", built: true },
      { href: "/shifts/open", label: "Open", purpose: "Shifts nobody is booked on yet.", built: true },
      { href: "/shifts/manage", label: "Manage", purpose: "All shifts: create, change and cancel.", built: true },
      { href: "/shifts/requests", label: "Request", purpose: "Requests from carers: shifts they want, swaps and time off.", built: true },
    ],
  },
  {
    title: "Supply",
    group: "flowstate",
    icon: "M3 7h13v10H3zM16 10h3l2 3v4h-5M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    items: [
      { href: "/supply/request", label: "Request", purpose: "Request workforce from agencies on Pleasant, or from your Preferred Supply List." },
      { href: "/supply/manage", label: "Manage", purpose: "Requests made, agency workers booked and their timesheets." },
    ],
  },
  {
    title: "Watchboard",
    group: "flowstate",
    icon: "M3 4h7v7H3zM14 4h7v12h-7zM3 13h7v7H3zM14 17h7v3h-7z",
    href: "/watchboard",
    built: true,
    purpose: "The important parts of every feature, in one view, with the Qualifiers as cards.",
  },
  {
    title: "Persona",
    group: "persona",
    icon: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z",
    items: [
      { href: "/persona/assist", label: "Assist", purpose: "Ask about your agency or get work done. Every change waits for your confirmation." },
      { href: "/persona/pushbots", label: "Pushbots", purpose: "Your agency's number that carers and office staff text." },
      { href: "/persona/qualifiers", label: "Qualifiers", purpose: "Competence, Compliance, Shift Readiness and Rapport in full: scores, what's flagged and why.", built: true },
      { href: "/persona/associate", label: "Associate", purpose: "Routines, your own directives (e.g. \"tell me when Sarah and Mark have a better rapport\"), and qualifying Packages or workforces." },
    ],
  },
  {
    title: "Office",
    group: "flowstate",
    icon: "M12 3l8 3v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6z",
    adminOnly: true,
    items: [
      { href: "/office/payroll", label: "Payroll", purpose: "Pay the agency's own carers." },
      { href: "/office/invoices", label: "Invoice", purpose: "Invoices from supply agencies, and invoices to councils and clients generated from Packages." },
      { href: "/office/bids", label: "Bid", purpose: "Bid for hospital-discharge packages and see which ones you can cover. Logistics only, no clinical detail." },
    ],
  },
  {
    title: "Elements",
    group: "elements",
    icon: "M4 5h4a1 1 0 0 1 1 1v2a2 2 0 0 0 4 0V6a1 1 0 0 1 1-1h4v4h-2a2 2 0 0 0 0 4h2v4h-4a1 1 0 0 1-1-1v-2a2 2 0 0 0-4 0v2a1 1 0 0 1-1 1H4z",
    items: [
      { href: "/elements/gateway", label: "Gateway", purpose: "Always-on contact centre, built in Canvas and connected by API.", built: true },
      { href: "/elements/peak", label: "Peak", purpose: "Recognition and rewards.", built: true },
    ],
  },
  {
    title: "Account",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
    adminOnly: true,
    items: [
      { href: "/account/settings", label: "Settings", purpose: "Agency settings." },
      { href: "/account/integrations", label: "Integrations", purpose: "Connected systems and APIs." },
      { href: "/account/organisation", label: "Organisation", purpose: "Your organisation's details, team and roles." },
      { href: "/account/links", label: "Links", purpose: "Publish anything as a link: a shift request to an agency, a carer invite, a praise link for a family, and more.", built: true },
    ],
  },
];

/** Find the page for a path, for placeholder pages. */
export function findPage(path: string): { section: NavSection; item?: NavItem } | null {
  for (const section of NAVIGATION) {
    if (section.href === path) return { section };
    const item = section.items?.find((i) => i.href === path);
    if (item) return { section, item };
  }
  return null;
}

/** Which list a path belongs to, so the sidebar opens on the right one. */
export function groupForPath(path: string): NavGroup | null {
  for (const section of NAVIGATION) {
    if (!section.group) continue;
    const hrefs = [section.href, ...(section.items ?? []).map((i) => i.href)];
    if (hrefs.some((h) => h && (path === h || path.startsWith(`${h}/`)))) return section.group;
  }
  if (path === "/elements" || path.startsWith("/elements/")) return "elements";
  return null;
}
