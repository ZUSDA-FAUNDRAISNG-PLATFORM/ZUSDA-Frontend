import { SimpleResourcePage } from "@/components/admin/SimpleResourcePage";

const SliderPage = () => (
  <SimpleResourcePage
    title="Homepage slider"
    description="These slides scroll in the about section marquee."
    collection="slides"
    defaults={{ imageUrl: "", title: "", caption: "", attribution: "" }}
    fields={[
      { key: "title", label: "Title" },
      { key: "caption", label: "Caption", type: "textarea" },
      { key: "attribution", label: "Attribution" },
      { key: "imageUrl", label: "Image", type: "image" },
    ]}
    preview={(item) => item.title || item.caption}
  />
);

export default SliderPage;
