import { SimpleResourcePage } from "@/components/admin/SimpleResourcePage";
import { ImageField } from "@/components/admin/ImageField";
import { compressImage } from "@/cms/utils";

const PLACEMENTS = [
  { value: "hero", label: "Hero slideshow" },
  { value: "scripture", label: "Scripture cards" },
];

const SliderPage = ({ placement = "hero" }: { placement?: "hero" | "scripture" }) => {
  const isHero = placement === "hero";
  const helpText = isHero
    ? "Large photos at the top of the landing page. Scripture cards are managed under Scripture cards."
    : "Scrolling verse cards below the mission section.";

  return (
    <SimpleResourcePage
      title={isHero ? "Hero slideshow" : "Scripture cards"}
      description={helpText}
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
      preview={(item) => item.title || item.caption}
    />
  );
};

export default SliderPage;
