import { FormEvent, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import type { CmsCollection, CmsState } from "@/cms/types";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FieldType = "text" | "textarea" | "image" | "date";

export function SimpleResourcePage<K extends CmsCollection>({
  title,
  description,
  collection,
  fields,
  defaults,
  preview,
}: {
  title: string;
  description: string;
  collection: K;
  fields: { key: string; label: string; type?: FieldType }[];
  defaults: Record<string, unknown>;
  preview?: (item: CmsState[K][number]) => string;
}) {
  const { state, upsertItem, deleteItem, saveCollection } = useCms();
  const items = state[collection] as Array<CmsState[K][number] & { id: number; published: boolean; sortOrder: number }>;
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    upsertItem(collection, editing as never);
    setEditing(null);
  };

  const move = (id: number, direction: -1 | 1) => {
    const ordered = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = ordered.findIndex((item) => item.id === id);
    const swap = index + direction;
    if (swap < 0 || swap >= ordered.length) return;
    const current = ordered[index];
    const neighbor = ordered[swap];
    saveCollection(
      collection,
      items.map((item) => {
        if (item.id === current.id) return { ...item, sortOrder: neighbor.sortOrder };
        if (item.id === neighbor.id) return { ...item, sortOrder: current.sortOrder };
        return item;
      }) as CmsState[K],
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button className="bg-navy text-white hover:bg-navy-light" onClick={() => setEditing({ ...defaults, published: true, sortOrder: items.length + 1 })}>
          Add
        </Button>
      </div>

      {editing ? (
        <form onSubmit={save} className="mb-8 grid gap-4 rounded-xl border border-navy/10 bg-white p-4 sm:p-6 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className={field.type === "textarea" || field.type === "image" ? "md:col-span-2" : ""}>
              {field.type === "textarea" ? (
                <>
                  <Label>{field.label}</Label>
                  <Textarea className="mt-1.5" value={String(editing[field.key] || "")} onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })} />
                </>
              ) : field.type === "image" ? (
                <ImageField label={field.label} value={String(editing[field.key] || "")} onChange={(value) => setEditing({ ...editing, [field.key]: value })} />
              ) : (
                <>
                  <Label>{field.label}</Label>
                  <Input
                    className="mt-1.5"
                    type={field.type === "date" ? "date" : "text"}
                    value={String(editing[field.key] || "")}
                    onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })}
                  />
                </>
              )}
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(editing.published)} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" className="bg-navy text-white hover:bg-navy-light">Save</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {[...items].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium text-navy">{preview ? preview(item) : `#${item.id}`}</p>
              <p className="text-xs text-navy/50">{item.published ? "Published" : "Unpublished"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(item)}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => move(item.id, -1)}>Up</Button>
              <Button size="sm" variant="outline" onClick={() => move(item.id, 1)}>Down</Button>
              <Button size="sm" variant="outline" onClick={() => upsertItem(collection, { ...item, published: !item.published })}>
                {item.published ? "Unpublish" : "Publish"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteItem(collection, item.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
