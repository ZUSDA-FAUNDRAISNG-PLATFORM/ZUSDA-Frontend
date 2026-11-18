
export type UserRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "member";

/** Crop / focus position for CMS images shown in cards. */
export type ImageFocal = "center" | "top" | "bottom" | "left" | "right";

export interface CmsUser {
  id: number;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface SiteSettings {
  churchName: string;
  tagline: string;
  /**
   * When set to a published committee id, the public Mission Committee section is shown.
   * When null/undefined, the section is hidden completely.
   */
  missionCommitteeId?: number | null;
  /** Hero left column — small label */
  heroEyebrow: string;
  /** Hero left column — main heading */
  heroTitle: string;
  /** Hero left column — highlighted second line */
  heroTitleHighlight: string;
  /** Hero left column — description */
  heroSubtitle: string;
  heroMeta: string;
  /** Deprecated for homepage card; highlights replace this. Kept for legacy CMS data. */
  heroImageUrl: string;
  heroPrimaryButtonText: string;
  heroPrimaryButtonLink: string;
  heroSecondaryButtonText: string;
  heroSecondaryButtonLink: string;
  heroExploreLinkText: string;
  heroExploreLink: string;
  heroSeeded?: boolean;
  countdownDate: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutBody: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
  ctaTitle: string;
  ctaBody: string;
  ctaImageUrl: string;
  footerBlurb: string;
  contactEmail: string;
  chairmanName: string;
  chairmanPhone: string;
  elderName: string;
  elderPhone: string;
  budgetGoal: number;
  paybill: string;
  paybillAccount: string;
  wordOfFaith: string;
}

export interface Poster {
  id: number;
  title: string;
  eyebrow: string;
  subtitle: string;
  description: string;
  verseText: string;
  verseRef: string;
  hymn: string;
  location: string;
  durationLabel: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  projectId?: number | null;
  focal?: ImageFocal;
  /** When set to a published committee, show that committee on the campaign. Hidden by default. */
  committeeId?: number | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
}

/**
 * Homepage Highlights use placement "hero".
 * Scripture cards use placement "scripture".
 */
export interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  /** Highlight / scripture supporting copy. */
  subtitle?: string;
  caption: string;
  attribution: string;
  /** Optional Bible verse for highlights. */
  verseText?: string;
  /** Optional event date label (e.g. 13–27 December 2026). */
  eventDate?: string;
  /** Optional location label. */
  location?: string;
  placement?: "hero" | "scripture";
  focal?: ImageFocal;
  /** Optional CTA on the highlight card. */
  buttonText?: string;
  buttonLink?: string;
  /** Future scheduling / media. */
  startsAt?: string | null;
  endsAt?: string | null;
  videoUrl?: string | null;
  published: boolean;
  sortOrder: number;
}

export interface ValueItem {
  id: number;
  title: string;
  description: string;
  icon: "book" | "heart" | "users" | "cross";
  published: boolean;
  sortOrder: number;
}

/** Named committee group managed in the CMS and assignable to content. */
export interface CommitteeGroup {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  published: boolean;
  sortOrder: number;
}

export interface CommitteeMember {
  id: number;
  name: string;
  position: string;
  department: string;
  bio: string;
  photoUrl: string;
  isChair: boolean;
  /** Optional link to a Committee group. */
  committeeId?: number | null;
  published: boolean;
  sortOrder: number;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  date: string;
  /** When set to a published committee, show that committee with this notice. Hidden by default. */
  committeeId?: number | null;
  published: boolean;
  sortOrder: number;
}

export interface EventItem {
  id: number;
  title: string;
  summary: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  focal?: ImageFocal;
  /** When set to a published committee, show that committee on the event. Hidden by default. */
  committeeId?: number | null;
  published: boolean;
  sortOrder: number;
}

export interface GalleryItem {
  id: number;
  imageUrl: string;
  caption: string;
  focal?: ImageFocal;
  published: boolean;
  sortOrder: number;
}

export interface Ministry {
  id: number;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  imageUrl?: string;
  focal?: ImageFocal;
  /** When set to a published committee, show that committee with this ministry. Hidden by default. */
  committeeId?: number | null;
  published: boolean;
  sortOrder: number;
}

/** General giving fund categories managed in the dashboard. */
export interface GivingCategoryItem {
  id: number;
  title: string;
  description: string;
  projectId?: number | null;
  published: boolean;
  sortOrder: number;
}

export interface CmsState {
  site: SiteSettings;
  posters: Poster[];
  slides: Slide[];
  values: ValueItem[];
  /** Named committees (groups) assignable to content. */
  committees: CommitteeGroup[];
  /** Individual committee members / leaders. */
  committee: CommitteeMember[];
  announcements: Announcement[];
  events: EventItem[];
  gallery: GalleryItem[];
  ministries: Ministry[];
  givingCategories: GivingCategoryItem[];
  users: CmsUser[];
}

export type CmsCollection = Exclude<keyof CmsState, "site" | "users">;
