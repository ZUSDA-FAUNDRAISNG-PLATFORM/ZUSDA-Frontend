import { useCms } from "@/cms/CmsProvider";
import { SimpleResourcePage } from "@/components/admin/SimpleResourcePage";
import { FOCAL_OPTIONS } from "@/lib/imageFocal";

function CommitteeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { state } = useCms();
  const options = [...(state.committees ?? [])]
    .filter((item) => item.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <label className="text-sm font-medium">Assigned Committee</label>
      <p className="mt-1 text-xs text-muted-foreground">
        Leave as None to hide committee details on this item.
      </p>
      <select
        className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">None</option>
        {options.map((item) => (
          <option key={item.id} value={String(item.id)}>
            {item.name}
          </option>
        ))}
      </select>
    </>
  );
}

const committeeField = {
  key: "committeeId",
  label: "Assigned Committee",
  render: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <CommitteeSelect value={value} onChange={onChange} />
  ),
};

const focalField = {
  key: "focal",
  label: "Image Focus",
  type: "select" as const,
  options: FOCAL_OPTIONS,
  fallbackValue: "center",
};

export const AnnouncementsPage = () => (
  <SimpleResourcePage
    title="Announcements"
    description="Visible notices appear on the homepage. Committee details stay hidden unless you assign one."
    collection="announcements"
    defaults={{ title: "", body: "", date: new Date().toISOString().slice(0, 10), committeeId: null }}
    fields={[
      { key: "title", label: "Title" },
      { key: "date", label: "Date", type: "date" },
      { key: "body", label: "Body", type: "textarea" },
      committeeField,
    ]}
    preview={(item) => item.title}
  />
);

export const EventsPage = () => (
  <SimpleResourcePage
    title="Events"
    description="Visible events appear on the homepage. Committee details stay hidden unless you assign one."
    collection="events"
    defaults={{
      title: "",
      summary: "",
      location: "Kinamba, Naivasha",
      startDate: "",
      endDate: "",
      imageUrl: "",
      focal: "center",
      committeeId: null,
    }}
    fields={[
      { key: "title", label: "Title" },
      { key: "location", label: "Location" },
      { key: "startDate", label: "Start date", type: "date" },
      { key: "endDate", label: "End date", type: "date" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "imageUrl", label: "Image", type: "image" },
      focalField,
      committeeField,
    ]}
    rowThumbnail={(item) => item.imageUrl}
    rowWarning={(item) => (!item.imageUrl ? "No image" : undefined)}
    preview={(item) => item.title}
  />
);

export const GalleryPage = () => (
  <SimpleResourcePage
    title="Media Library"
    description="Visible photos appear in the public gallery."
    collection="gallery"
    defaults={{ imageUrl: "", caption: "", focal: "center" }}
    fields={[
      { key: "caption", label: "Caption" },
      { key: "imageUrl", label: "Image", type: "image" },
      focalField,
    ]}
    rowThumbnail={(item) => item.imageUrl}
    preview={(item) => item.caption || "Gallery image"}
  />
);

export const MinistriesPage = () => (
  <SimpleResourcePage
    title="Ministries / Get involved"
    description="These cards appear in the Get Involved section. Committee details stay hidden unless you assign one."
    collection="ministries"
    defaults={{
      title: "",
      description: "",
      actionLabel: "Learn more",
      actionHref: "#involved",
      imageUrl: "",
      focal: "center",
      committeeId: null,
    }}
    fields={[
      { key: "title", label: "Title" },
      { key: "actionLabel", label: "Button label" },
      { key: "actionHref", label: "Button link" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "imageUrl", label: "Image (optional)", type: "image" },
      focalField,
      committeeField,
    ]}
    rowThumbnail={(item) => item.imageUrl || ""}
    preview={(item) => item.title}
  />
);

export const GivingCategoriesPage = () => (
  <SimpleResourcePage
    title="Giving categories"
    description="Visible categories appear in the General Giving flow (Tithes, Mission, Offering, etc.)."
    collection="givingCategories"
    defaults={{ title: "", description: "", projectId: 1 }}
    fields={[
      { key: "title", label: "Category name" },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "projectId",
        label: "Linked project ID",
        render: ({ value, onChange }) => (
          <>
            <label className="text-sm font-medium">Linked project ID</label>
            <input
              className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              inputMode="numeric"
              value={value}
              onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
            />
          </>
        ),
      },
    ]}
    preview={(item) => item.title}
  />
);
