import helpingHands from "@/assets/helping-hands.jpg";
import type { Slide } from "./types";
import gregoryDaghe from "@/assets/committee/Gregory_Daghe.webp";
import pastorMoses from "@/assets/committee/Pastor_Moses_Kariuki.webp";
import leahMonchari from "@/assets/committee/Leah_Monchari.webp";
import branolJoseph from "@/assets/committee/Branol_Joseph.webp";
import gregoryNjeka from "@/assets/committee/Gregory_Njeka.webp";
import jimCarson from "@/assets/committee/Jim_Carson.webp";
import hellenJuma from "@/assets/committee/Hellen_Juma.webp";
import robertCarlos from "@/assets/committee/Robert_Carlos.webp";
import ericNtongai from "@/assets/committee/Eric_Ntongai.webp";
import deborahKeira from "@/assets/committee/Deborah_Keira.webp";
import annMaroa from "@/assets/committee/Ann_Maroa.webp";
import type { CmsState, Poster } from "./types";
import type { EventCollectionDTO } from "@/api/collections";

const motivationImages = Object.entries(
  import.meta.glob("../assets/motivations/*.{jpg,jpeg,png,webp}", {
    eager: true,
    import: "default",
  }) as Record<string, string>,
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src);

// export const defaultHeroSlides: Slide[] = [
//   {
//     id: 5,
//     imageUrl: heroBg,
//     title: "Njooni Tusemezane",
//     subtitle: "",
//     caption: "A welcoming home for faith-driven giving and prayer.",
//     attribution: "",
//     verseText: "Isaiah 1:18 (NKJV)",
//     eventDate: "13–27 December 2026",
//     location: "Kinamba, Naivasha",
//     placement: "hero",
//     buttonText: "",
//     buttonLink: "",
//     focal: "center",
//     published: true,
//     sortOrder: 1,
//   },
//   {
//     id: 6,
//     imageUrl: worshipSunrise,
//     title: "Mission in Kinamba",
//     subtitle: "",
//     caption: "Fifteen days of evangelism and community outreach.",
//     attribution: "",
//     verseText: "",
//     eventDate: "December 2026",
//     location: "Kinamba, Naivasha",
//     placement: "hero",
//     buttonText: "",
//     buttonLink: "",
//     focal: "center",
//     published: true,
//     sortOrder: 2,
//   },
//   {
//     id: 7,
//     imageUrl: helpingHands,
//     title: "Serving Together",
//     subtitle: "",
//     caption: "Pray, give, and go as we advance the gospel.",
//     attribution: "",
//     verseText: "",
//     eventDate: "",
//     location: "Zetech University SDA",
//     placement: "hero",
//     buttonText: "",
//     buttonLink: "",
//     focal: "center",
//     published: true,
//     sortOrder: 3,
//   },
// ];

export function missingDefaultHeroSlides(slides: Slide[]) {
  const heroImagePaths = new Set(
    slides.filter((slide) => slide.placement === "hero").map((slide) => slide.imageUrl),
  );
  return defaultHeroSlides.filter((slide) => !heroImagePaths.has(slide.imageUrl));
}

export async function createSeedState(): Promise<CmsState> {
  return {
    site: {
      churchName: "ZUSDA",
      tagline: "Seventh-day Adventist Church · Zetech University",
      heroEyebrow: "ZUSDA Evangelical Mission 2026",
      heroTitle: "Supporting God's Work Through",
      heroTitleHighlight: "Faith, Giving & Service",
      heroSubtitle:
        "Join Zetech University SDA in advancing the gospel through transparent giving, prayer, and mission service.",
      heroMeta: "Kinamba, Naivasha · December 2026",
      heroImageUrl: "",
      heroPrimaryButtonText: "Give Now",
      heroPrimaryButtonLink: "/give?mode=general",
      heroSecondaryButtonText: "Share Prayer Request",
      heroSecondaryButtonLink: "pray",
      heroExploreLinkText: "Explore Campaigns",
      heroExploreLink: "#campaigns",
      heroSeeded: false,
      countdownDate: "2026-12-13T00:00:00",
      aboutEyebrow: "About the Mission",
      aboutTitle: "A Faith-Driven Outreach Initiative",
      aboutBody:
        "Grounded in the Great Commission (Matthew 28:19), the ZUSDA Evangelical Mission 2026 seeks to spread the Gospel, reach souls, and demonstrate God's love through evangelism and service in Kinamba, Naivasha.",
      missionTitle: "Our Mission",
      missionBody:
        "To spread the Gospel, reach souls, and demonstrate God's love through evangelism, discipleship, and service in Kinamba, Naivasha.",
      visionTitle: "Our Vision",
      visionBody:
        "A transformed community grounded in the Great Commission — united in prayer, fellowship, and faithful service.",
      ctaTitle: "God is Calling.\nThe Mission is Ready.\nYou Are Invited.",
      ctaBody:
        "Be part of something eternal. Whether through prayer, giving, or going — your response matters. Join us in Kinamba, Naivasha this December.",
      ctaImageUrl: helpingHands,
      footerBlurb: "\"Njooni Tusemezane\" — Come Now, Let Us Reason Together",
      contactEmail: "zetechuniversity.sda@gmail.com",
      chairmanName: "Gregory Daghe",
      chairmanPhone: "+254 742 618 592",
      elderName: "Elder Robert Carlos",
      elderPhone: "+254 110 264 570",
      budgetGoal: 416000,
      paybill: "247247",
      paybillAccount: "593021",
      wordOfFaith: "Every shilling contributed is a seed sown in the Kingdom of God.",
      missionCommitteeId: 1,
    },
    posters: defaultPosters(),
    committees: [
      {
        id: 1,
        name: "Mission Committee",
        description: "Leaders serving the Kinamba evangelical mission across ministry departments.",
        imageUrl: gregoryDaghe,
        published: true,
        sortOrder: 1,
      },
      {
        id: 2,
        name: "Evangelism Committee",
        description: "Preaching and spiritual coordination for outreach.",
        imageUrl: pastorMoses,
        published: true,
        sortOrder: 2,
      },
      {
        id: 3,
        name: "Finance Committee",
        description: "Stewardship and accountability for mission giving.",
        imageUrl: branolJoseph,
        published: true,
        sortOrder: 3,
      },
    ],
    slides: [
      ...defaultHeroSlides,
      {
        id: 1,
        imageUrl: helpingHands,
        title: "Bear one another's burdens",
        caption: "Bear one another's burdens, and so fulfill the law of Christ.",
        attribution: "Galatians 6:2",
        placement: "scripture",
        published: true,
        sortOrder: 1,
      },
      {
        id: 2,
        imageUrl: motivationImages[0] || worshipSunrise,
        title: "Go therefore",
        caption: "Go therefore and make disciples of all nations.",
        attribution: "Matthew 28:19",
        placement: "scripture",
        published: true,
        sortOrder: 2,
      },
      {
        id: 3,
        imageUrl: worshipSunrise,
        title: "Love in deed",
        caption: "Let us not love in word or talk but in deed and in truth.",
        attribution: "1 John 3:18",
        placement: "scripture",
        published: true,
        sortOrder: 3,
      },
      {
        id: 4,
        imageUrl: heroBg,
        title: "The least of these",
        caption: "Truly, I say to you, as you did it to one of the least of these, you did it to me.",
        attribution: "Matthew 25:40",
        placement: "scripture",
        published: true,
        sortOrder: 4,
      },
    ],
    values: [
      {
        id: 1,
        title: "Spread the Word",
        description: "Sharing the Gospel message of hope, restoration, and God's unconditional love with the community.",
        icon: "book",
        published: true,
        sortOrder: 1,
      },
      {
        id: 2,
        title: "Transform Lives",
        description: "Through personal encounters and acts of service, we aim to bring lasting transformation and hope.",
        icon: "heart",
        published: true,
        sortOrder: 2,
      },
      {
        id: 3,
        title: "Build Community",
        description: "Uniting believers across regions to work together in purpose, prayer, and fellowship.",
        icon: "users",
        published: true,
        sortOrder: 3,
      },
    ],
    committee: [
      { id: 1, name: "Gregory Daghe", position: "Mission Chairman", department: "General Oversight", bio: "", photoUrl: gregoryDaghe, isChair: true, committeeId: 1, published: true, sortOrder: 1 },
      { id: 2, name: "Pastor Moses Kariuki", position: "Leader", department: "Evangelism / PM", bio: "Preaching & spiritual coordination", photoUrl: pastorMoses, isChair: false, committeeId: 2, published: true, sortOrder: 2 },
      { id: 3, name: "Leah Monchari", position: "Leader", department: "Evangelism / PM", bio: "Preaching & spiritual coordination", photoUrl: leahMonchari, isChair: false, committeeId: 2, published: true, sortOrder: 3 },
      { id: 4, name: "Branol Joseph", position: "Leader", department: "Finance", bio: "Stewardship & accountability", photoUrl: branolJoseph, isChair: false, committeeId: 3, published: true, sortOrder: 4 },
      { id: 5, name: "Gregory Njeka", position: "Leader", department: "Finance", bio: "Stewardship & accountability", photoUrl: gregoryNjeka, isChair: false, committeeId: 3, published: true, sortOrder: 5 },
      { id: 6, name: "Eld. Jim Carson", position: "Leader", department: "Media & Communication", bio: "Outreach, publicity & documentation", photoUrl: jimCarson, isChair: false, committeeId: 1, published: true, sortOrder: 6 },
      { id: 7, name: "Hellen Juma", position: "Leader", department: "Media & Communication", bio: "Outreach, publicity & documentation", photoUrl: hellenJuma, isChair: false, committeeId: 1, published: true, sortOrder: 7 },
      { id: 8, name: "Eld. Robert Carlos", position: "Leader", department: "Transport & Logistics", bio: "Movement, accommodation & supplies", photoUrl: robertCarlos, isChair: false, committeeId: 1, published: true, sortOrder: 8 },
      { id: 9, name: "Eric Ntongai", position: "Leader", department: "Transport & Logistics", bio: "Movement, accommodation & supplies", photoUrl: ericNtongai, isChair: false, committeeId: 1, published: true, sortOrder: 9 },
      { id: 10, name: "Deborah Keira", position: "Leader", department: "Food & Catering", bio: "Meals & hospitality", photoUrl: deborahKeira, isChair: false, committeeId: 1, published: true, sortOrder: 10 },
      { id: 11, name: "Ann Maroa", position: "Leader", department: "Food & Catering", bio: "Meals & hospitality", photoUrl: annMaroa, isChair: false, committeeId: 1, published: true, sortOrder: 11 },
    ],
    announcements: [
      {
        id: 1,
        title: "Mission dates confirmed",
        body: "The evangelical mission will take place in Kinamba, Naivasha from 13–27 December 2026. Join us in prayer as preparations continue.",
        date: "2026-09-01",
        published: true,
        sortOrder: 1,
      },
    ],
    events: [
      {
        id: 1,
        title: "Kinamba Mission 2026",
        summary: "15 days of evangelism, fellowship, and service.",
        location: "Kinamba, Naivasha",
        startDate: "2026-12-13",
        endDate: "2026-12-27",
        imageUrl: helpingHands,
        focal: "center",
        committeeId: 1,
        published: true,
        sortOrder: 1,
      },
    ],
    gallery: [],
    ministries: [
      {
        id: 1,
        title: "Pray",
        description: "Join the prayer team covering the mission, missionaries, and the Kinamba community before, during, and after the outreach.",
        actionLabel: "Join prayer team",
        actionHref: "#pray",
        published: true,
        sortOrder: 1,
      },
      {
        id: 2,
        title: "Give",
        description: "Support transport, meals, materials, and evangelism needs. Every contribution is an investment in eternity.",
        actionLabel: "Give now",
        actionHref: "#give",
        published: true,
        sortOrder: 2,
      },
      {
        id: 3,
        title: "Go",
        description: "Participate physically as a missionary during the 15-day outreach. Open to all willing individuals ready to serve.",
        actionLabel: "Register to Go",
        actionHref: "#go",
        published: true,
        sortOrder: 3,
      },
    ],
    givingCategories: [
      { id: 1, title: "Tithes", description: "Faithful returning of tithe.", projectId: 1, published: true, sortOrder: 1 },
      { id: 2, title: "Mission", description: "Evangelism and outreach support.", projectId: 1, published: true, sortOrder: 2 },
      { id: 3, title: "Local Church Funds", description: "Local congregation operating needs.", projectId: 1, published: true, sortOrder: 3 },
      { id: 4, title: "Offering", description: "Freewill offering for worship and ministry.", projectId: 1, published: true, sortOrder: 4 },
      { id: 5, title: "Music Ministry", description: "Support for worship and music ministry.", projectId: 1, published: true, sortOrder: 5 },
      { id: 6, title: "Other", description: "Other designated gifts.", projectId: 1, published: true, sortOrder: 6 },
    ],
  };
}

function defaultPosters(): Poster[] {
  return [
    {
      id: 1,
      title: "Kinamba Mission",
      eyebrow: "Current outreach",
      subtitle: "Come Now, Let Us Reason Together",
      description: "Njooni Tusemezane — the 2026 evangelical mission in Kinamba, Naivasha.",
      verseText:
        "Come now, and let us reason together, says the Lord, Though your sins are like scarlet, they shall be as white as snow; though they are red like crimson, they shall be as wool.",
      verseRef: "Isaiah 1:18 (NKJV)",
      hymn: "Hymn 170 (NZK)",
      location: "Kinamba, Naivasha",
      durationLabel: "13–27 December 2026",
      imageUrl: helpingHands,
      ctaLabel: "Support Kinamba Mission",
      ctaHref: "#budget",
      projectId: 1,
      focal: "center",
      committeeId: 1,
      featured: true,
      published: true,
      sortOrder: 1,
    },
  ];
}

export function postersFromLegacyCollections(collections: EventCollectionDTO[]): Poster[] {
  return collections.map((item, index) => ({
    id: item.id || index + 1,
    title: item.themeTitle || item.name,
    eyebrow: item.eyebrow || "Outreach",
    subtitle: item.themeSubtitle || "",
    description: item.hymnDesc || "",
    verseText: item.verseText || "",
    verseRef: item.verseRef || "",
    hymn: item.hymn || "",
    location: item.location || "Kinamba, Naivasha",
    durationLabel: item.durationLabel || "",
    imageUrl: item.posterUrl || helpingHands,
    ctaLabel: `Support ${item.name}`,
    ctaHref: "#budget",
    projectId: item.projectId ?? 1,
    focal: "center" as const,
    committeeId: null,
    featured: Boolean(item.isPrimary),
    published: true,
    sortOrder: index + 1,
  }));
}
