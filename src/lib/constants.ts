// Canonical application statuses (from career-ops/templates/states.yml)
export const STATUSES = [
  { id: "Evaluated", label: "Evaluated", description: "Report completed, pending decision", color: "text" },
  { id: "Applied", label: "Applied", description: "Application submitted", color: "sky" },
  { id: "Responded", label: "Responded", description: "Company has responded", color: "blue" },
  { id: "Interview", label: "Interview", description: "Active interview process", color: "green" },
  { id: "Offer", label: "Offer", description: "Offer received", color: "green" },
  { id: "Rejected", label: "Rejected", description: "Rejected by company", color: "muted" },
  { id: "Discarded", label: "Discarded", description: "Discarded by candidate or offer closed", color: "muted" },
  { id: "SKIP", label: "SKIP", description: "Doesn't fit, don't apply", color: "red" },
] as const;

export type StatusId = (typeof STATUSES)[number]["id"];

// Status priority for sorting (lower = higher priority)
export const STATUS_PRIORITY: Record<string, number> = {
  Interview: 0,
  Offer: 1,
  Responded: 2,
  Applied: 3,
  Evaluated: 4,
  SKIP: 5,
  Rejected: 6,
  Discarded: 7,
};

// Scoring dimensions with weights
export const SCORING_DIMENSIONS = [
  { key: "northStar", label: "North Star Alignment", weight: 0.25, helpLow: "Completely unrelated to target roles", helpHigh: "Exact match to primary target role" },
  { key: "cvMatch", label: "CV Match", weight: 0.15, helpLow: "Less than 40% requirement match", helpHigh: "90%+ requirement match" },
  { key: "seniority", label: "Seniority Level", weight: 0.15, helpLow: "Junior/entry level", helpHigh: "Staff+ or leadership" },
  { key: "compensation", label: "Compensation", weight: 0.10, helpLow: "Well below market rate", helpHigh: "Top quartile compensation" },
  { key: "growth", label: "Growth Trajectory", weight: 0.10, helpLow: "Dead-end position", helpHigh: "Clear path to next level" },
  { key: "remote", label: "Remote Quality", weight: 0.05, helpLow: "On-site only, no flexibility", helpHigh: "Full remote, async-friendly" },
  { key: "companyRep", label: "Company Reputation", weight: 0.05, helpLow: "Red flags or unknown", helpHigh: "Top employer, strong brand" },
  { key: "techStack", label: "Tech Stack / Tools", weight: 0.05, helpLow: "Legacy or irrelevant tools", helpHigh: "Modern, aligned with your skills" },
  { key: "speedToOffer", label: "Speed to Offer", weight: 0.05, helpLow: "6+ month process", helpHigh: "Fast, efficient hiring" },
  { key: "cultural", label: "Cultural Signals", weight: 0.05, helpLow: "Bureaucratic, unclear values", helpHigh: "Builder culture, clear mission" },
] as const;

export type DimensionKey = (typeof SCORING_DIMENSIONS)[number]["key"];

// Score thresholds
export const SCORE_THRESHOLDS = {
  DRAFT_ANSWERS: 4.5,
  RECOMMEND_APPLY: 4.0,
  GENERATE_PDF: 3.0,
  DISCOURAGE: 3.0,
};

// Default archetypes (users customize these during onboarding)
export const DEFAULT_ARCHETYPES = [
  { name: "Project Manager", level: "Senior", fit: "primary" },
  { name: "Program Manager", level: "Senior", fit: "secondary" },
  { name: "Technical Project Manager", level: "Senior", fit: "primary" },
];

// Tracker filter tabs
export const TRACKER_TABS = [
  { id: "all", label: "All" },
  { id: "evaluated", label: "Evaluated", status: "Evaluated" },
  { id: "applied", label: "Applied", status: "Applied" },
  { id: "interview", label: "Interview", status: "Interview" },
  { id: "top", label: "Top \u22654", minScore: 4.0 },
  { id: "skip", label: "Skip", status: "SKIP" },
] as const;

// Sidebar navigation
export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/tracker", label: "Tracker", icon: "KanbanSquare" },
  { href: "/evaluate", label: "Evaluate", icon: "ClipboardCheck" },
  { href: "/cv", label: "CV Editor", icon: "FileText" },
  { href: "/scanner", label: "Scanner", icon: "Radar" },
  { href: "/profile", label: "Profile", icon: "UserCog" },
] as const;
