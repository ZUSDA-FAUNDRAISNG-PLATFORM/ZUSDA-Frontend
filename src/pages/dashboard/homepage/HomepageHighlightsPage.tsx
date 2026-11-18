import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "@/cms/CmsProvider";
import { missingDefaultHeroSlides } from "@/cms/seed";
import type { Slide } from "@/cms/types";
import { compressImage, nextId } from "@/cms/utils";
import { ImageField } from "@/components/admin/ImageField";
import { HeroHighlightsCard } from "@/components/hero/HeroHighlightsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Draft = Partial<Slide> & { id?: number };

const emptyDraft = (): Draft => ({
  imageUrl: "",
  title: "",
  caption: "",
  verseText: "",
  eventDate: "",
  location: "",
  buttonText: "",
  buttonLink: "",
  startsAt: "",
  endsAt: "",
  videoUrl: "",
  placement: "hero",
  focal: "center",
  published: true,
  attribution: "",
  subtitle: "",
});

const HomepageHighlightsPage = () => {
  const { state, cmsAnswered, upsertItem, deleteItem, saveCollection, importDefaultHeroSlides } = useCms();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const highlights = useMemo(
    () =>
      [...state.slides]
        .filter((slide) => slide.placement === "hero")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [state.slides],
  );

  const active = highlights.filter((item) => item.published && item.imageUrl.trim());
  const modeLabel =
    active.length === 0 ? "Empty State" : active.length === 1 ? "Static Image" : "Automatic Slideshow";

  useEffect(() => {
    if (cmsAnswered && !state.site.heroSeeded) {
      void importDefaultHeroSlides();
    }
  }, [cmsAnswered, importDefaultHeroSlides, state.site.heroSeeded]);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (!String(editing.imageUrl ?? "").trim()) {
      setError("Add a featured image before saving.");
      return;
    }
    setError("");
    const id = editing.id || nextId(state.slides);
    const sortOrder =
      editing.sortOrder ??
      (highlights.length ? Math.max(...highlights.map((item) => item.sortOrder)) + 1 : 1);
    upsertItem("slides", {
      ...emptyDraft(),
      ...editing,
      id,
      placement: "hero",
      sortOrder,
      published: Boolean(editing.published),
      caption: editing.caption || "",
      attribution: editing.attribution || "",
    } as Slide);
    setEditing(null);
  };

  const duplicate = (item: Slide) => {
    upsertItem("slides", {
      ...item,
      id: nextId(state.slides),
      title: `${item.title || "Highlight"} (copy)`,
      published: false,
      sortOrder: (highlights[highlights.length - 1]?.sortOrder ?? 0) + 1,
    });
  };

  const reorder = (fromId: number, toId: number) => {
    if (fromId === toId) return;
    const ordered = [...highlights];
    const fromIndex = ordered.findIndex((item) => item.id === fromId);
    const toIndex = ordered.findIndex((item) => item.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = ordered.splice(fromIndex, 1);
    ordered.splice(toIndex, 0, moved);
    const others = state.slides.filter((slide) => slide.placement !== "hero");
    saveCollection("slides", [
      ...others,
      ...ordered.map((item, index) => ({ ...item, sortOrder: index + 1 })),
    ]);
  };

  const previewHighlight = (editing
    ? ([
        {
          ...(emptyDraft() as Slide),
          ...editing,
          id: editing.id || 0,
          placement: "hero" as const,
          published: true,
          sortOrder: 1,
          imageUrl: String(editing.imageUrl || ""),
          title: String(editing.title || "Highlight title"),
          caption: String(editing.caption || "Caption preview"),
        },
      ] as Slide[])
    : active
  ).filter((item) => item.imageUrl?.trim());

  const missingDefaults = missingDefaultHeroSlides(highlights).length > 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark">Homepage</p>
          <h1 className="font-display text-3xl font-bold text-navy">Homepage Highlights</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage the right-side Hero Image Card only. Left-side hero text stays under{" "}
            <Link to="/dashboard/homepage/hero" className="font-medium text-navy underline-offset-2 hover:underline">
              Hero Content
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {cmsAnswered && missingDefaults ? (
            <Button variant="outline" onClick={() => void importDefaultHeroSlides(true)}>
              Import defaults
            </Button>
          ) : null}
          <Button className="bg-navy text-white hover:bg-navy-light" onClick={() => setEditing(emptyDraft())}>
            Add Highlight
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-xs text-navy/60">Active Highlights</p>
          <p className="mt-1 font-display text-3xl font-bold text-navy">{active.length}</p>
        </div>
        <div className="rounded-xl border border-navy/10 bg-white p-4 sm:col-span-2">
          <p className="text-xs text-navy/60">Current Display Mode</p>
          <p className="mt-1 font-display text-2xl font-bold text-navy">{modeLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Updates automatically from published highlights with images.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          {editing ? (
            <form onSubmit={save} className="space-y-4 rounded-xl border border-navy/10 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold text-navy">
                  {editing.id ? "Edit Highlight" : "Add Highlight"}
                </h2>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
              <ImageField
                label="Featured Image"
                value={String(editing.imageUrl || "")}
                onChange={(imageUrl) => setEditing({ ...editing, imageUrl })}
                maxFileSizeBytes={8 * 1024 * 1024}
                compress={compressImage}
              />
              <div>
                <Label>Title</Label>
                <Input
                  className="mt-1.5"
                  value={String(editing.title || "")}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Caption</Label>
                <Textarea
                  className="mt-1.5"
                  rows={3}
                  value={String(editing.caption || "")}
                  onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Bible Verse (optional)</Label>
                  <Input
                    className="mt-1.5"
                    value={String(editing.verseText || "")}
                    onChange={(e) => setEditing({ ...editing, verseText: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Event Date (optional)</Label>
                  <Input
                    className="mt-1.5"
                    value={String(editing.eventDate || "")}
                    onChange={(e) => setEditing({ ...editing, eventDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location (optional)</Label>
                  <Input
                    className="mt-1.5"
                    value={String(editing.location || "")}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CTA Button Text (optional)</Label>
                  <Input
                    className="mt-1.5"
                    value={String(editing.buttonText || "")}
                    onChange={(e) => setEditing({ ...editing, buttonText: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>CTA Button Link (optional)</Label>
                <Input
                  className="mt-1.5"
                  value={String(editing.buttonLink || "")}
                  onChange={(e) => setEditing({ ...editing, buttonLink: e.target.value })}
                />
              </div>
              <details className="rounded-lg border border-navy/10 p-3">
                <summary className="cursor-pointer text-sm font-medium text-navy">Future-ready fields</summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="datetime-local"
                      className="mt-1.5"
                      value={String(editing.startsAt || "").slice(0, 16)}
                      onChange={(e) => setEditing({ ...editing, startsAt: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="datetime-local"
                      className="mt-1.5"
                      value={String(editing.endsAt || "").slice(0, 16)}
                      onChange={(e) => setEditing({ ...editing, endsAt: e.target.value || null })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Video URL</Label>
                    <Input
                      className="mt-1.5"
                      value={String(editing.videoUrl || "")}
                      onChange={(e) => setEditing({ ...editing, videoUrl: e.target.value || null })}
                    />
                  </div>
                </div>
              </details>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(editing.published)}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                />
                Visible on website
              </label>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="bg-navy text-white hover:bg-navy-light">
                Save Highlight
              </Button>
            </form>
          ) : null}

          <div className="space-y-3">
            {highlights.map((item) => (
              <article
                key={item.id}
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragId != null) reorder(dragId, item.id);
                  setDragId(null);
                }}
                className="flex flex-col gap-3 rounded-xl border border-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="h-14 w-20 shrink-0 rounded-md object-cover" />
                  ) : (
                    <div className="h-14 w-20 shrink-0 rounded-md bg-navy/5" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy">{item.title || "Untitled highlight"}</p>
                    <p className="text-xs text-navy/50">
                      {item.published ? "Visible" : "Hidden"} · Display position {item.sortOrder}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => duplicate(item)}>
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => upsertItem("slides", { ...item, published: !item.published })}
                  >
                    {item.published ? "Hide" : "Make Visible"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteItem("slides", item.id)}>
                    Delete
                  </Button>
                </div>
              </article>
            ))}
            {!highlights.length ? (
              <p className="rounded-xl border border-dashed border-navy/15 bg-white p-6 text-sm text-muted-foreground">
                No highlights yet. Add one to populate the Hero Image Card.
              </p>
            ) : null}
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gold-dark">Live preview</p>
          <HeroHighlightsCard
            highlights={(previewHighlight.length ? previewHighlight : []) as never}
            preview
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Preview mirrors the public Hero Image Card. Drag list items to reorder display.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomepageHighlightsPage;
