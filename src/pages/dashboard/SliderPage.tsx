import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCms } from "@/cms/CmsProvider";
import { missingDefaultHeroSlides } from "@/cms/seed";
import { SimpleResourcePage } from "@/components/admin/SimpleResourcePage";
import { ImageField } from "@/components/admin/ImageField";
import { compressImage } from "@/cms/utils";

const PLACEMENTS = [
  { value: "hero", label: "Hero slideshow" },
  { value: "scripture", label: "Scripture cards" },
];

const SliderPage = ({ placement = "hero" }: { placement?: "hero" | "scripture" }) => {
  const isHero = placement === "hero";
  const { state, cmsAnswered, importDefaultHeroSlides } = useCms();
  const heroSlides = state.slides.filter((slide) => slide.placement === "hero");
  const missingDefaultPhotos = missingDefaultHeroSlides(heroSlides).length > 0;
  const livePhotoCount = heroSlides.filter((slide) => slide.published && slide.imageUrl.trim()).length;
  const helpText = isHero
    ? "Large photos at the top of the landing page. Scripture cards are managed under Scripture cards."
    : "Scrolling verse cards below the mission section.";

  useEffect(() => {
    if (isHero && cmsAnswered && !state.site.heroSeeded) {
      void importDefaultHeroSlides();
    }
  }, [cmsAnswered, importDefaultHeroSlides, isHero, state.site.heroSeeded]);

  return (
    <SimpleResourcePage
      title={isHero ? "Hero slideshow" : "Scripture cards"}
      description={helpText}
      note={isHero ? "Add at least 1 photo; with 2 or more they rotate." : undefined}
      requireImage={isHero}
      summary={isHero ? `${livePhotoCount} photos live on the site` : undefined}
      headerAction={
        isHero && cmsAnswered && missingDefaultPhotos ? (
          <Button variant="outline" onClick={() => void importDefaultHeroSlides(true)}>
            Import default photos
          </Button>
        ) : undefined
      }
      collection="slides"
      defaults={{ imageUrl: "", title: "", caption: "", attribution: "", placement, focal: "center" }}
      fields={[
        { key: "title", label: "Title" },
        { key: "caption", label: "Caption", type: "textarea" },
        { key: "attribution", label: "Attribution" },
        ...(isHero
          ? [{
              key: "focal",
              label: "Photo focal point",
              type: "select" as const,
              options: [
                { value: "center", label: "Center" },
                { value: "top", label: "Top" },
                { value: "bottom", label: "Bottom" },
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
              ],
              fallbackValue: "center",
            }]
          : []),
        {
          key: "placement",
          label: "Placement",
          type: "select",
          options: PLACEMENTS,
          fallbackValue: "scripture",
        },
        {
          key: "imageUrl",
          label: "Image",
          type: "image",
          render: ({ value, onChange }) => (
            <ImageField
              label="Image"
              value={value}
              onChange={onChange}
              maxFileSizeBytes={8 * 1024 * 1024}
              compress={compressImage}
            />
          ),
        },
      ]}
      itemFilter={(item) => (isHero ? item.placement === "hero" : item.placement !== "hero")}
      rowBadge={(item) => (item.placement === "hero" ? "Hero slideshow" : "Scripture cards")}
      rowThumbnail={(item) => isHero ? item.imageUrl : ""}
      rowWarning={(item) => isHero && !item.imageUrl.trim() ? "No image" : undefined}
      preview={(item) => item.title || item.caption}
    />
  );
};

export default SliderPage;
