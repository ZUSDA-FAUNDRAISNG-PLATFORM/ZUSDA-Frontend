import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useCms } from "@/cms/CmsProvider";
import type { Poster } from "@/cms/types";
import { nextId } from "@/cms/utils";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyPoster = (): Omit<Poster, "id"> => ({
  title: "",
  eyebrow: "Outreach",
  subtitle: "",
  description: "",
  verseText: "",
  verseRef: "",
  hymn: "",
  location: "Kinamba, Naivasha",
  durationLabel: "",
  imageUrl: "",
  ctaLabel: "Support this outreach",
  ctaHref: "#budget",
  projectId: 1,
  featured: false,
  published: true,
  sortOrder: 99,
});

const PostersPage = () => {
  const { state, upsertItem, deleteItem, saveCollection } = useCms();
  const [editing, setEditing] = useState<Partial<Poster> | null>(null);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!editing?.title?.trim()) {
      toast.error("Title is required.");
      return;
    }
    const payload: Poster = {
      ...emptyPoster(),
      ...editing,
      title: editing.title.trim(),
      id: editing.id || nextId(state.posters),
      projectId: Number(editing.projectId || 1),
    };
    const next = editing.id
      ? state.posters.map((item) => (item.id === payload.id ? payload : payload.featured ? { ...item, featured: false } : item))
      : [...(payload.featured ? state.posters.map((item) => ({ ...item, featured: false })) : state.posters), payload];
    saveCollection("posters", next);
    toast.success(editing.id ? "Poster saved." : "Poster added.");
    setEditing(null);
  };

  const move = (id: number, direction: -1 | 1) => {
    const ordered = [...state.posters].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = ordered.findIndex((item) => item.id === id);
    const swap = index + direction;
    if (swap < 0 || swap >= ordered.length) return;
    const current = ordered[index];
    const neighbor = ordered[swap];
    saveCollection(
      "posters",
      state.posters.map((item) => {
        if (item.id === current.id) return { ...item, sortOrder: neighbor.sortOrder };
        if (item.id === neighbor.id) return { ...item, sortOrder: current.sortOrder };
        return item;
      }),
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Homepage posters</h1>
          <p className="text-sm text-muted-foreground">These cards appear in the theme / outreach section.</p>
        </div>
        <Button className="bg-navy text-white hover:bg-navy-light" onClick={() => setEditing(emptyPoster())}>
          Add poster
        </Button>
      </div>

      {editing ? (
        <form onSubmit={save} className="mb-8 grid gap-4 rounded-xl border border-navy/10 bg-white p-4 sm:p-6 md:grid-cols-2">
          <Field label="Title" value={editing.title || ""} onChange={(title) => setEditing({ ...editing, title })} />
          <Field label="Eyebrow" value={editing.eyebrow || ""} onChange={(eyebrow) => setEditing({ ...editing, eyebrow })} />
          <Field label="Subtitle" value={editing.subtitle || ""} onChange={(subtitle) => setEditing({ ...editing, subtitle })} />
          <Field label="CTA label" value={editing.ctaLabel || ""} onChange={(ctaLabel) => setEditing({ ...editing, ctaLabel })} />
          <Field label="CTA link" value={editing.ctaHref || ""} onChange={(ctaHref) => setEditing({ ...editing, ctaHref })} />
          <Field label="Location" value={editing.location || ""} onChange={(location) => setEditing({ ...editing, location })} />
          <Field label="Dates" value={editing.durationLabel || ""} onChange={(durationLabel) => setEditing({ ...editing, durationLabel })} />
          <Field label="Hymn" value={editing.hymn || ""} onChange={(hymn) => setEditing({ ...editing, hymn })} />
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea className="mt-1.5" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Verse</Label>
            <Textarea className="mt-1.5" value={editing.verseText || ""} onChange={(e) => setEditing({ ...editing, verseText: e.target.value })} />
          </div>
          <Field label="Verse reference" value={editing.verseRef || ""} onChange={(verseRef) => setEditing({ ...editing, verseRef })} />
          <Field label="Giving project ID" value={String(editing.projectId ?? "")} onChange={(projectId) => setEditing({ ...editing, projectId: Number(projectId) || null })} />
          <ImageField label="Poster image" value={editing.imageUrl || ""} onChange={(imageUrl) => setEditing({ ...editing, imageUrl })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(editing.published)} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(editing.featured)} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
            Featured
          </label>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" className="bg-navy text-white hover:bg-navy-light">Save poster</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...state.posters].sort((a, b) => a.sortOrder - b.sortOrder).map((poster) => (
          <article key={poster.id} className="overflow-hidden rounded-xl border border-navy/10 bg-white">
            {poster.imageUrl ? <img src={poster.imageUrl} alt={poster.title} className="aspect-[4/5] w-full object-cover" /> : <div className="aspect-[4/5] bg-cream" />}
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-semibold text-navy">{poster.title}</h2>
                  <p className="text-xs text-navy/50">{poster.published ? "Published" : "Unpublished"}{poster.featured ? " · Featured" : ""}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(poster)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => move(poster.id, -1)}>Up</Button>
                <Button size="sm" variant="outline" onClick={() => move(poster.id, 1)}>Down</Button>
                <Button size="sm" variant="outline" onClick={() => upsertItem("posters", { ...poster, published: !poster.published })}>
                  {poster.published ? "Unpublish" : "Publish"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteItem("posters", poster.id)}>Delete</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <div>
    <Label>{label}</Label>
    <Input className="mt-1.5" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default PostersPage;
