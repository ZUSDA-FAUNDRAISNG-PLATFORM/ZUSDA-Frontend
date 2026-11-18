import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GivingCategory } from "@/lib/giving/types";

type CategoryStepProps = {
  categories: GivingCategory[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSetSelected: (ids: string[]) => void;
};

/**
 * Searchable multi-select for CMS giving categories (general giving only).
 */
export function CategoryStep({ categories, selectedIds, onToggle, onSetSelected }: CategoryStepProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false),
    );
  }, [categories, query]);

  const selected = categories.filter((item) => selectedIds.includes(item.id));

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-heading sm:text-3xl">Select category</h2>
      <p className="mt-2 text-body">
        Choose one or more giving categories managed by the church. You can split your gift across them next.
      </p>

      <div className="relative mt-6">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-card border border-[#1C1D4D]/12 bg-white px-4 py-3 text-left shadow-[0_4px_20px_rgba(21,22,58,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <span className={cn("text-sm font-medium", selected.length ? "text-heading" : "text-muted-body")}>
            {selected.length
              ? `${selected.length} categor${selected.length === 1 ? "y" : "ies"} selected`
              : "Select category"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-body" aria-hidden />
        </button>

        {open ? (
          <div
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-card border border-[#1C1D4D]/10 bg-white shadow-[0_14px_36px_rgba(21,22,58,0.12)]"
            role="listbox"
            aria-multiselectable="true"
          >
            <div className="flex items-center gap-2 border-b border-[#1C1D4D]/8 px-3 py-2">
              <Search className="h-4 w-4 text-muted-body" aria-hidden />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search categories…"
                className="min-h-11 w-full bg-transparent text-sm text-heading outline-none placeholder:text-muted-body"
                aria-label="Search giving categories"
              />
            </div>
            <ul className="max-h-64 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-sm text-muted-body">No categories match your search.</li>
              ) : (
                filtered.map((category) => {
                  const active = selectedIds.includes(category.id);
                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => onToggle(category.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[#F7F8FC]",
                          active && "bg-[#EEF2F7]",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                            active ? "border-brand bg-brand text-white" : "border-[#1C1D4D]/25",
                          )}
                          aria-hidden
                        >
                          {active ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-heading">{category.label}</span>
                          {category.description ? (
                            <span className="mt-0.5 block text-xs text-muted-body">{category.description}</span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
            <div className="flex items-center justify-between border-t border-[#1C1D4D]/8 px-3 py-2">
              <button
                type="button"
                className="min-h-11 px-2 text-sm font-medium text-muted-body hover:text-heading"
                onClick={() => onSetSelected([])}
              >
                Clear
              </button>
              <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selected.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Selected categories">
          {selected.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand/20 bg-[#EEF2F7] px-3 py-1.5 text-sm font-medium text-heading"
              >
                {item.label}
                <X className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">Remove {item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-body" aria-live="polite">
          {categories.length
            ? "No categories selected yet."
            : "No giving categories are currently available."}
        </p>
      )}
    </div>
  );
}

export default CategoryStep;
