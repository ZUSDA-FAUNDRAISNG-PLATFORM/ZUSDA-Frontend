import { FormEvent, useState, type ReactNode } from "react";
import { useCms } from "@/cms/CmsProvider";
import type { CmsCollection, CmsState } from "@/cms/types";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FieldType = "text" | "textarea" | "image" | "date" | "select";

export function SimpleResourcePage<K extends CmsCollection>({
  title,
  description,
  collection,
  fields,
  defaults,
  preview,
  itemFilter,
  rowBadge,
  rowThumbnail,
  rowWarning,
  summary,
  headerAction,
  note,
  requireImage = false,
}: {
  title: string;
  description: string;
  collection: K;
  fields: {
    key: string;
    label: string;
    type?: FieldType;
    options?: { value: string; label: string }[];
    fallbackValue?: string;
    render?: (props: { value: string; onChange: (value: string) => void }) => ReactNode;
  }[];
  defaults: Record<string, unknown>;
  preview?: (item: CmsState[K][number]) => string;
  itemFilter?: (item: CmsState[K][number]) => boolean;
  rowBadge?: (item: CmsState[K][number]) => string;
  rowThumbnail?: (item: CmsState[K][number]) => string;
  rowWarning?: (item: CmsState[K][number]) => string | undefined;
  summary?: string;
  headerAction?: ReactNode;
  note?: string;
  requireImage?: boolean;
}) {
  const { state, upsertItem, deleteItem, saveCollection } = useCms();
  const items = state[collection] as Array<CmsState[K][number] & { id: number; published: boolean; sortOrder: number }>;
  const visibleItems = items.filter((item) => !itemFilter || itemFilter(item)).sort((a, b) => a.sortOrder - b.sortOrder);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [validationError, setValidationError] = useState("");

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const savedItem = { ...editing };
    if (requireImage && !String(savedItem.imageUrl ?? "").trim()) {
      setValidationError("Add an image before saving.");
      return;
    }
    setValidationError("");
    fields.forEach((field) => {
      if (field.type === "select" && savedItem[field.key] === undefined && field.fallbackValue !== undefined) {
        savedItem[field.key] = field.fallbackValue;
      }
    });
    upsertItem(collection, savedItem as never);
    setEditing(null);
  };

  const move = (id: number, direction: -1 | 1) => {
    const ordered = visibleItems;
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
          {note ? <p className="mt-1 text-sm font-medium text-navy/70">{note}</p> : null}
          {summary ? <p className="mt-2 text-sm font-semibold text-navy">{summary}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {headerAction}
          <Button className="bg-navy text-white hover:bg-navy-light" onClick={() => setEditing({ ...defaults, published: true, sortOrder: items.length + 1 })}>
            Add
          </Button>
        </div>
      </div>

      {editing ? (
        <form onSubmit={save} className="mb-8 grid gap-4 rounded-xl border border-navy/10 bg-white p-4 sm:p-6 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className={field.type === "textarea" || field.type === "image" ? "md:col-span-2" : ""}>
              {field.render ? (
                field.render({
                  value: String(editing[field.key] || ""),
                  onChange: (value) => setEditing({ ...editing, [field.key]: value }),
                })
                ) : field.type === "select" ? (
                  <>
                    <Label>{field.label}</Label>
                    <select
                      className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={String(editing[field.key] ?? field.fallbackValue ?? "")}
                      onChange={(event) => setEditing({ ...editing, [field.key]: event.target.value })}
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </>
                ) : field.type === "textarea" ? (
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
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(editing.published)} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            Published
          </label>
          {validationError ? <p role="alert" className="text-sm text-destructive md:col-span-2">{validationError}</p> : null}
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" className="bg-navy text-white hover:bg-navy-light">Save</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {rowThumbnail ? (
                rowThumbnail(item) ? (
                  <img src={rowThumbnail(item)} alt="" aria-hidden="true" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                ) : (
                  <div aria-hidden="true" className="h-12 w-16 shrink-0 rounded-md bg-navy/5" />
                )
              ) : null}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-navy">{preview ? preview(item) : `#${item.id}`}</p>
                  {rowBadge ? (
                    <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy/70">
                      {rowBadge(item)}
                    </span>
                  ) : null}
                  {rowWarning?.(item) ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                      {rowWarning(item)}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-navy/50">{item.published ? "Published" : "Unpublished"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(item as unknown as Record<string, unknown>)}>Edit</Button>
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
