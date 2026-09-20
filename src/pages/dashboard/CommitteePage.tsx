import { FormEvent, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import type { CommitteeMember } from "@/cms/types";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyMember = (): Omit<CommitteeMember, "id"> => ({
  name: "",
  position: "",
  department: "",
  bio: "",
  photoUrl: "",
  isChair: false,
  published: true,
  sortOrder: 99,
});

const CommitteePage = () => {
  const { state, upsertItem, deleteItem, saveCollection } = useCms();
  const [editing, setEditing] = useState<Partial<CommitteeMember> | null>(null);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!editing?.name?.trim()) return;
    upsertItem("committee", { ...editing, name: editing.name.trim() });
    setEditing(null);
  };

  const move = (id: number, direction: -1 | 1) => {
    const ordered = [...state.committee].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = ordered.findIndex((item) => item.id === id);
    const swap = index + direction;
    if (swap < 0 || swap >= ordered.length) return;
    const current = ordered[index];
    const neighbor = ordered[swap];
    saveCollection(
      "committee",
      state.committee.map((item) => {
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
          <h1 className="font-display text-3xl font-bold text-navy">Committee members</h1>
          <p className="text-sm text-muted-foreground">Add, edit, or remove leaders shown on the public committee section.</p>
        </div>
        <Button className="bg-navy text-white hover:bg-navy-light" onClick={() => setEditing(emptyMember())}>
          Add member
        </Button>
      </div>

      {editing ? (
        <form onSubmit={save} className="mb-8 grid gap-4 rounded-xl border border-navy/10 bg-white p-4 sm:p-6 md:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input className="mt-1.5" required value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </div>
          <div>
            <Label>Position</Label>
            <Input className="mt-1.5" value={editing.position || ""} onChange={(e) => setEditing({ ...editing, position: e.target.value })} />
          </div>
          <div>
            <Label>Department</Label>
            <Input className="mt-1.5" value={editing.department || ""} onChange={(e) => setEditing({ ...editing, department: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Bio / role note</Label>
            <Textarea className="mt-1.5" value={editing.bio || ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
          </div>
          <ImageField label="Photo" value={editing.photoUrl || ""} onChange={(photoUrl) => setEditing({ ...editing, photoUrl })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(editing.isChair)} onChange={(e) => setEditing({ ...editing, isChair: e.target.checked })} />
            Mission chairman
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(editing.published)} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" className="bg-navy text-white hover:bg-navy-light">Save member</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...state.committee].sort((a, b) => a.sortOrder - b.sortOrder).map((member) => (
          <article key={member.id} className="rounded-xl border border-navy/10 bg-white p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-cream">
                {member.photoUrl ? <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <h2 className="font-medium text-navy">{member.name}</h2>
                <p className="text-xs text-navy/50">{member.position} · {member.department}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(member)}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => move(member.id, -1)}>Up</Button>
              <Button size="sm" variant="outline" onClick={() => move(member.id, 1)}>Down</Button>
              <Button size="sm" variant="outline" onClick={() => upsertItem("committee", { ...member, published: !member.published })}>
                {member.published ? "Unpublish" : "Publish"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteItem("committee", member.id)}>Delete</Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default CommitteePage;
