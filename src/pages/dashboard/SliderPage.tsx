import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCms } from "@/cms/CmsProvider";
import { missingDefaultHeroSlides } from "@/cms/seed";
import { SimpleResourcePage } from "@/components/admin/SimpleResourcePage";
import { ImageField } from "@/components/admin/ImageField";
import { compressImage } from "@/cms/utils";

const PLACEMENTS = [
  { value: "hero", label: "Homepage Highlights" },
  { value: "scripture", label: "Scripture Cards" },
];

const SliderPage = ({ placement = "hero" }: { placement?: "hero" | "scripture" }) => {
  const isHero = placement === "hero";
  const { state, cmsAnswered, importDefaultHeroSlides } = useCms();
  const heroSlides = state.slides.filter((slide) => slide.placement === "hero");
  const missingDefaultPhotos = missingDefaultHeroSlides(heroSlides).length > 0;
  const livePhotoCount = heroSlides.filter((slide) => slide.published && slide.imageUrl.trim()).length;
  const helpText = isHero
    ? "Use Homepage → Homepage Highlights to manage the Hero Image Card."
    : "Scrolling verse cards shown with mission content.";

  useEffect(() => {
    if (isHero && cmsAnswered && !state.site.heroSeeded) {
      void importDefaultHeroSlides();
    }
  }, [cmsAnswered, importDefaultHeroSlides, isHero, state.site.heroSeeded]);

  return (
    <SimpleResourcePage
      title={isHero ? "Homepage Highlights" : "Scripture Cards"}
      description={helpText}
      note={
        isHero
          ? "Make highlights visible with an image. Display position controls sequence. Hide a highlight to remove it from the site."
          : undefined
      }
      requireImage={isHero}
      summary={isHero ? `${livePhotoCount} visible highlight${livePhotoCount === 1 ? "" : "s"} on the homepage` : undefined}
      headerAction={
        isHero && cmsAnswered && missingDefaultPhotos ? (
          <Button variant="outline" onClick={() => void importDefaultHeroSlides(true)}>
            Import default photos
          </Button>
        ) : undefined
      }
      collection="slides"
      defaults={{
        imageUrl: "",
        title: "",
        subtitle: "",
        caption: "",
        attribution: "",
        buttonText: "",
        buttonLink: "",
        placement,
        focal: "center",
      }}
      fields={[
        { key: "title", label: "Title / Heading" },
        ...(isHero
          ? [
              { key: "subtitle", label: "Subtitle / Description", type: "textarea" as const },
              { key: "buttonText", label: "Button text" },
              { key: "buttonLink", label: "Button link (e.g. /give?mode=general, /#campaigns, https://…)" },
            ]
          : [
              { key: "caption", label: "Caption", type: "textarea" as const },
              { key: "attribution", label: "Attribution" },
            ]),
        ...(isHero
          ? [
              {
                key: "focal",
                label: "Image Focus",
                type: "select" as const,
                options: [
                  { value: "center", label: "Center" },
                  { value: "top", label: "Top" },
                  { value: "bottom", label: "Bottom" },
                  { value: "left", label: "Left" },
                  { value: "right", label: "Right" },
                ],
                fallbackValue: "center",
              },
            ]
          : []),
        {
          key: "placement",
          label: "Placement",
          type: "select",
          options: PLACEMENTS,
          fallbackValue: isHero ? "hero" : "scripture",
        },
        {
          key: "imageUrl",
          label: "Image",
          type: "image",
          render: ({ value, onChange }) => (
            <ImageField
              label="Hero image"
              value={value}
              onChange={onChange}
              maxFileSizeBytes={8 * 1024 * 1024}
              compress={compressImage}
            />
          ),
        },
      ]}
      itemFilter={(item) => (isHero ? item.placement === "hero" : item.placement !== "hero")}
      rowBadge={(item) => (item.placement === "hero" ? "Highlight" : "Scripture card")}
      rowThumbnail={(item) => (isHero ? item.imageUrl : "")}
      rowWarning={(item) => (isHero && !item.imageUrl.trim() ? "No image" : undefined)}
      preview={(item) => item.title || item.subtitle || item.caption || "Untitled slide"}
    />
  );
};

export default SliderPage;
