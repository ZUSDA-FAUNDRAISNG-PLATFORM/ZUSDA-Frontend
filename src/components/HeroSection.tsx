import { motion } from "framer-motion";
import { useCms } from "@/cms/CmsProvider";
import { HeroCmsLink } from "@/components/hero/HeroCmsLink";
import { HeroHighlightsCard } from "@/components/hero/HeroHighlightsCard";
import { useHomepageHighlights } from "@/hooks/useHomepageHighlights";

/**
 * Homepage Hero — static left content from CMS Hero Content;
 * right Image Card driven by Homepage Highlights (0 / 1 / 2+).
 */
const HeroSection = () => {
  const { state } = useCms();
  const { highlights, ready } = useHomepageHighlights();
  const site = state.site;

  const eyebrow = site.heroEyebrow?.trim() || "ZUSDA Evangelical Mission 2026";
  const title = site.heroTitle?.trim() || "Supporting God's Work Through";
  const highlight = site.heroTitleHighlight?.trim() || "Faith, Giving & Service";
  const description =
    site.heroSubtitle?.trim() ||
    "Join Zetech University SDA in advancing the gospel through transparent giving, prayer, and mission service.";
  const primaryText = site.heroPrimaryButtonText?.trim() || "Give Now";
  const primaryLink = site.heroPrimaryButtonLink?.trim() || "/give?mode=general";
  const secondaryText = site.heroSecondaryButtonText?.trim() || "Share Prayer Request";
  const secondaryLink = site.heroSecondaryButtonLink?.trim() || "pray";
  const exploreText = site.heroExploreLinkText?.trim() || "Explore Campaigns";
  const exploreLink = site.heroExploreLink?.trim() || "#campaigns";

  return (
    <section id="home" className="relative overflow-hidden bg-page pt-24 md:pt-28">
      <div className="container relative z-10 mx-auto grid items-center gap-10 px-4 pb-14 pt-8 lg:grid-cols-2 lg:gap-14 lg:pb-20 lg:pt-12">
        <div className="text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="section-eyebrow"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="font-display text-4xl font-bold leading-[1.15] text-heading sm:text-5xl lg:text-[3.25rem]"
          >
            {title}
            {highlight ? <span className="block text-gold-dark"> {highlight}</span> : null}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-body sm:text-lg lg:mx-0"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-8 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start"
          >
            <HeroCmsLink label={primaryText} href={primaryLink} className="btn-gold" />
            <HeroCmsLink label={secondaryText} href={secondaryLink} className="btn-secondary" />
            <HeroCmsLink
              label={exploreText}
              href={exploreLink}
              className="inline-flex min-h-11 items-center justify-center rounded-button px-6 py-3 text-base font-semibold text-heading underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14 }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <HeroHighlightsCard highlights={highlights} loading={!ready} />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
