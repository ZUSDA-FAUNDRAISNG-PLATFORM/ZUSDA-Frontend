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
import {
  createLocalCollection,
  fileToDataUrl,
  loadLocalCollections,
  removeLocalCollection,
  saveLocalCollections,
  setLocalPoster,
  setLocalPrimary,
} from "@/lib/localCollections";

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
  uploadPoster: (id: number, file: File) => Promise<void>;
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
  const [useLocal, setUseLocal] = useState(false);

  const applyCollections = (items: EventCollectionDTO[], preferredId?: number | null) => {
    const normalized = items.map(toViewModel);
    setCollections(normalized);
    const preferred = preferredId != null ? normalized.find((item) => item.id === preferredId) : null;
    const primary = normalized.find((item) => item.isPrimary);
    setActiveId(preferred?.id ?? primary?.id ?? normalized[0]?.id ?? null);
  };

  const refresh = async () => {
    setIsLoading(true);
    try {
      const [items, primary] = await Promise.all([listCollections(), getPrimaryCollection().catch(() => null)]);
      setUseLocal(false);
      applyCollections(items, primary?.id);
    } catch {
      setUseLocal(true);
      applyCollections(loadLocalCollections());
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
    if (useLocal) {
      const next = collections.map((item) => (item.id === activeCollection.id ? { ...item, ...patch } : item));
      saveLocalCollections(next);
      applyCollections(next, activeCollection.id);
      toast.success("Collection updated.");
      return;
    }
    const updated = await updateCollection(activeCollection.id, patch);
    const next = collections.map((c) => (c.id === updated.id ? toViewModel(updated) : c));
    setCollections(next);
    setActiveId(updated.id);
    toast.success("Collection updated.");
  };

  const addCollection = async (name: string) => {
    if (useLocal) {
      const created = createLocalCollection(name, collections);
      applyCollections([...collections, created], created.id);
      toast.success("Outreach added.");
      return;
    }
    try {
      const created = await createCollection({ name });
      const next = [...collections, toViewModel(created)];
      setCollections(next);
      setActiveId(created.id);
      toast.success("Collection created.");
    } catch {
      const created = createLocalCollection(name, collections);
      setUseLocal(true);
      applyCollections([...collections, created], created.id);
      toast.success("Outreach saved locally until the admin server is ready.");
    }
  };

  const removeCollection = async (id: number) => {
    if (useLocal) {
      const next = removeLocalCollection(id, collections);
      applyCollections(next);
      toast.success("Outreach removed.");
      return;
    }
    await deleteCollection(id);
    const next = collections.filter((c) => c.id !== id);
    setCollections(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
    toast.success("Collection removed.");
  };

  const setPrimary = async (id: number) => {
    if (useLocal) {
      const updated = setLocalPrimary(id, collections);
      applyCollections(loadLocalCollections(), updated?.id);
      toast.success("Featured outreach updated.");
      return;
    }
    try {
      const updated = await setPrimaryCollection(id);
      const next = collections.map((c) => (c.id === updated.id ? toViewModel(updated) : { ...c, isPrimary: false }));
      setCollections(next);
      setActiveId(updated.id);
      toast.success("Primary collection updated.");
    } catch {
      const updated = setLocalPrimary(id, collections);
      setUseLocal(true);
      applyCollections(loadLocalCollections(), updated?.id);
      toast.success("Featured outreach updated locally.");
    }
  };

  const uploadPosterFor = async (id: number, file: File) => {
    const saveLocally = async () => {
      const posterUrl = await fileToDataUrl(file);
      const updated = setLocalPoster(id, posterUrl, collections);
      applyCollections(loadLocalCollections(), updated.id);
      toast.success("Poster updated.");
    };

    if (useLocal) {
      await saveLocally();
      return;
    }

    try {
      const updated = await uploadPoster(id, file);
      setCollections((current) => current.map((c) => (c.id === updated.id ? toViewModel(updated) : c)));
      toast.success("Poster updated.");
    } catch {
      await saveLocally();
      setUseLocal(true);
      toast.success("Poster saved locally until the admin server is ready.");
    }
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
        uploadPoster: uploadPosterFor,
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
