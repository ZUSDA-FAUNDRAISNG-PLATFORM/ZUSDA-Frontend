import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { toast } from "sonner";
import {
  createCollection,
  deleteCollection,
  getPrimaryCollection,
  listCollections,
  setPrimaryCollection,
  updateCollection,
  uploadPoster,
  type EventCollectionDTO,
} from "@/api/collections";
import { resolveAssetUrl } from "@/api/client";

interface Ctx {
  collections: EventCollectionDTO[];
  activeId: number | null;
  activeCollection: EventCollectionDTO | null;
  isLoading: boolean;
  setActiveId: (id: number) => void;
  updateActiveCollection: (patch: Partial<EventCollectionDTO>) => Promise<void>;
  addCollection: (name: string) => Promise<void>;
  removeCollection: (id: number) => Promise<void>;
  setPrimary: (id: number) => Promise<void>;
  uploadPoster: (file: File) => Promise<void>;
}

const EventCollectionsContext = createContext<Ctx | null>(null);

function toViewModel(collection: EventCollectionDTO): EventCollectionDTO {
  return {
    ...collection,
    posterUrl: resolveAssetUrl(collection.posterUrl),
  };
}

export function EventCollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<EventCollectionDTO[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const [items, primary] = await Promise.all([listCollections(), getPrimaryCollection().catch(() => null)]);
      const normalized = items.map(toViewModel);
      setCollections(normalized);
      if (primary) {
        setActiveId(primary.id);
      } else if (normalized.length) {
        setActiveId(normalized[0].id);
      } else {
        setActiveId(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load collections from the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const activeCollection = useMemo(
    () => collections.find((c) => c.id === activeId) ?? collections[0] ?? null,
    [collections, activeId],
  );

  const updateActiveCollection = async (patch: Partial<EventCollectionDTO>) => {
    if (!activeCollection?.id) return;
    const updated = await updateCollection(activeCollection.id, patch);
    const next = collections.map((c) => (c.id === updated.id ? toViewModel(updated) : c));
    setCollections(next);
    setActiveId(updated.id);
    toast.success("Collection updated.");
  };

  const addCollection = async (name: string) => {
    const created = await createCollection({ name });
    const next = [...collections, toViewModel(created)];
    setCollections(next);
    setActiveId(created.id);
    toast.success("Collection created.");
  };

  const removeCollection = async (id: number) => {
    await deleteCollection(id);
    const next = collections.filter((c) => c.id !== id);
    setCollections(next);
    if (activeId === id) {
      setActiveId(next[0]?.id ?? null);
    }
    toast.success("Collection removed.");
  };

  const setPrimary = async (id: number) => {
    const updated = await setPrimaryCollection(id);
    const next = collections.map((c) => (c.id === updated.id ? toViewModel(updated) : { ...c, isPrimary: false }));
    setCollections(next);
    setActiveId(updated.id);
    toast.success("Primary collection updated.");
  };

  const uploadPosterForActive = async (file: File) => {
    if (!activeCollection?.id) return;
    const updated = await uploadPoster(activeCollection.id, file);
    const next = collections.map((c) => (c.id === updated.id ? toViewModel(updated) : c));
    setCollections(next);
    toast.success("Poster uploaded.");
  };

  return (
    <EventCollectionsContext.Provider
      value={{
        collections,
        activeId,
        activeCollection,
        isLoading,
        setActiveId,
        updateActiveCollection,
        addCollection,
        removeCollection,
        setPrimary,
        uploadPoster: uploadPosterForActive,
      }}
    >
      {children}
    </EventCollectionsContext.Provider>
  );
}

export function useEventCollections() {
  const ctx = useContext(EventCollectionsContext);
  if (!ctx) throw new Error("useEventCollections must be used within EventCollectionsProvider");
  return ctx;
}
