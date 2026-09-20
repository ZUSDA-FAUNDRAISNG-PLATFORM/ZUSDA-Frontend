export type UserRole = "admin" | "member";

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
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroMeta: string;
  heroImageUrl: string;
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
  featured: boolean;
  published: boolean;
  sortOrder: number;
}

export interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  caption: string;
  attribution: string;
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

export interface CommitteeMember {
  id: number;
  name: string;
  position: string;
  department: string;
  bio: string;
  photoUrl: string;
  isChair: boolean;
  published: boolean;
  sortOrder: number;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  date: string;
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
  published: boolean;
  sortOrder: number;
}

export interface GalleryItem {
  id: number;
  imageUrl: string;
  caption: string;
  published: boolean;
  sortOrder: number;
}

export interface Ministry {
  id: number;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  published: boolean;
  sortOrder: number;
}

export interface CmsState {
  site: SiteSettings;
  posters: Poster[];
  slides: Slide[];
  values: ValueItem[];
  committee: CommitteeMember[];
  announcements: Announcement[];
  events: EventItem[];
  gallery: GalleryItem[];
  ministries: Ministry[];
  users: CmsUser[];
}

export type CmsCollection = Exclude<keyof CmsState, "site" | "users">;
