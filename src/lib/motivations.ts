import helpingHands from "@/assets/helping-hands.jpg";
import worshipSunrise from "@/assets/worship-sunrise.jpg";
import heroBg from "@/assets/hero-bg.jpg";

/**
 * Motivation slides for the About marquee.
 *
 * Drop additional photos into `src/assets/motivations/`
 * (for example `03-fellowship.jpg` and `04-outreach.jpg`).
 * They are picked up automatically, in filename order, and replace
 * the temporary fallback images. Admin CMS URLs still win at runtime.
 */
export interface MotivationSlide {
  id: number;
  imageUrl: string;
  quote: string;
  attribution: string;
  alt: string;
  sortOrder: number;
  isActive: boolean;
}

const motivationFolderImages = import.meta.glob(
  "../assets/motivations/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" },
) as Record<string, string>;

const SLIDE_COPY: Pick<MotivationSlide, "quote" | "attribution" | "alt">[] = [
  {
    quote: "Bear one another's burdens, and so fulfill the law of Christ.",
    attribution: "Galatians 6:2",
    alt: "Believers reaching out to help one another at sunset",
  },
  {
    quote: "Go therefore and make disciples of all nations.",
    attribution: "Matthew 28:19",
    alt: "Compass pointing toward mission",
  },
  {
    quote: "Let us not love in word or talk but in deed and in truth.",
    attribution: "1 John 3:18",
    alt: "Worship at sunrise",
  },
  {
    quote: "Truly, I say to you, as you did it to one of the least of these, you did it to me.",
    attribution: "Matthew 25:40",
    alt: "Gathered believers preparing for mission",
  },
];

function uniqueImages(sources: string[]) {
  const seen = new Set<string>();
  const images: string[] = [];

  for (const src of sources) {
    if (!src || seen.has(src)) continue;
    seen.add(src);
    images.push(src);
  }

  return images;
}

const folderImages = Object.entries(motivationFolderImages)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src);

const imagePool = uniqueImages([helpingHands, ...folderImages, worshipSunrise, heroBg]);

export const DEFAULT_MOTIVATIONS: MotivationSlide[] = SLIDE_COPY.map((copy, index) => ({
  id: index + 1,
  imageUrl: imagePool[index] ?? helpingHands,
  quote: copy.quote,
  attribution: copy.attribution,
  alt: copy.alt,
  sortOrder: index + 1,
  isActive: true,
}));
