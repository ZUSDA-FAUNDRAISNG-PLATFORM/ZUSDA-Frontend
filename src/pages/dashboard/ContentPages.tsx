import { SimpleResourcePage } from "@/components/admin/SimpleResourcePage";

export const AnnouncementsPage = () => (
  <SimpleResourcePage
    title="Announcements"
    description="Published notices appear on the homepage."
    collection="announcements"
    defaults={{ title: "", body: "", date: new Date().toISOString().slice(0, 10) }}
    fields={[
      { key: "title", label: "Title" },
      { key: "date", label: "Date", type: "date" },
      { key: "body", label: "Body", type: "textarea" },
    ]}
    preview={(item) => item.title}
  />
);

export const EventsPage = () => (
  <SimpleResourcePage
    title="Events"
    description="Published events appear on the homepage events section."
    collection="events"
    defaults={{ title: "", summary: "", location: "Kinamba, Naivasha", startDate: "", endDate: "", imageUrl: "" }}
    fields={[
      { key: "title", label: "Title" },
      { key: "location", label: "Location" },
      { key: "startDate", label: "Start date", type: "date" },
      { key: "endDate", label: "End date", type: "date" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "imageUrl", label: "Image", type: "image" },
    ]}
    preview={(item) => item.title}
  />
);

export const GalleryPage = () => (
  <SimpleResourcePage
    title="Gallery"
    description="Published photos appear in the homepage gallery."
    collection="gallery"
    defaults={{ imageUrl: "", caption: "" }}
    fields={[
      { key: "caption", label: "Caption" },
      { key: "imageUrl", label: "Image", type: "image" },
    ]}
    preview={(item) => item.caption || "Gallery image"}
  />
);

export const MinistriesPage = () => (
  <SimpleResourcePage
    title="Ministries / Get involved"
    description="These cards appear in the Get Involved section."
    collection="ministries"
    defaults={{ title: "", description: "", actionLabel: "Learn more", actionHref: "#involved" }}
    fields={[
      { key: "title", label: "Title" },
      { key: "actionLabel", label: "Button label" },
      { key: "actionHref", label: "Button link" },
      { key: "description", label: "Description", type: "textarea" },
    ]}
    preview={(item) => item.title}
  />
);
