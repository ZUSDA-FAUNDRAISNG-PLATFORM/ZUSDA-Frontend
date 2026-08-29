import { useState } from "react";
import { useEventCollections } from "@/hooks/useEventCollections";
import { ChevronDown, Plus, Trash2, Star } from "lucide-react";

const CollectionSwitcher = () => {
  const { collections, activeId, setActiveId, addCollection, removeCollection, setPrimary } =
    useEventCollections();
  const [open, setOpen] = useState(false);

  const active = collections.find((c) => c.id === activeId);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-gold border border-gold/20 rounded-full px-3 py-1"
      >
        {active?.name ?? "Select event"}
        {active?.isPrimary && <Star size={12} className="fill-gold text-gold" />}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-64 bg-navy border border-gold/20 rounded-xl shadow-lg overflow-hidden">
          {collections.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-3 py-2 hover:bg-gold/10">
              <button
                onClick={() => {
                  setActiveId(c.id);
                  setOpen(false);
                }}
                className={`text-sm text-left flex-1 flex items-center gap-1 ${
                  c.id === activeId ? "text-gold font-semibold" : "text-primary-foreground/80"
                }`}
              >
                {c.name}
                {c.isPrimary && <Star size={12} className="fill-gold text-gold" />}
              </button>
              <div className="flex items-center gap-2">
                {!c.isPrimary && (
                  <button
                    onClick={() => void setPrimary(c.id)}
                    title="Set as primary (default on load)"
                    className="text-primary-foreground/40 hover:text-gold"
                  >
                    <Star size={14} />
                  </button>
                )}
                {collections.length > 1 && (
                  <button onClick={() => void removeCollection(c.id)} className="text-primary-foreground/40 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const name = prompt("New event name (e.g. Youth Week 2026):");
              if (name) void addCollection(name);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gold hover:bg-gold/10 border-t border-gold/10"
          >
            <Plus size={14} /> New event
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectionSwitcher;
