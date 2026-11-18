import { FormEvent, useMemo, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import type { CommitteeGroup, CommitteeMember } from "@/cms/types";
import { nextId } from "@/cms/utils";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { focalObjectClass } from "@/lib/imageFocal";

type Tab = "groups" | "members";

const emptyGroup = (): Omit<CommitteeGroup, "id"> => ({
  name: "",
  description: "",
  imageUrl: "",
  published: true,
  sortOrder: 99,
});

const emptyMember = (): Omit<CommitteeMember, "id"> => ({
  name: "",
  position: "",
  department: "",
  bio: "",
  photoUrl: "",
  isChair: false,
  committeeId: null,
  published: true,
  sortOrder: 99,
});

const CommitteePage = () => {
  const { state, upsertItem, deleteItem, saveCollection, updateSite } = useCms();
  const [tab, setTab] = useState<Tab>("groups");
  const [editingGroup, setEditingGroup] = useState<Partial<CommitteeGroup> | null>(null);
  const [editingMember, setEditingMember] = useState<Partial<CommitteeMember> | null>(null);

  const groups = useMemo(
    () => [...(state.committees ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [state.committees],
  );
  const members = useMemo(
    () => [...state.committee].sort((a, b) => a.sortOrder - b.sortOrder),
    [state.committee],
  );

  const committeeOptions = [
    { value: "", label: "None" },
    ...groups.map((group) => ({ value: String(group.id), label: group.name })),
  ];

  const saveGroup = (event: FormEvent) => {
    event.preventDefault();
    if (!editingGroup?.name?.trim()) return;
    const id = editingGroup.id || nextId(groups);
    const payload: CommitteeGroup = {
      ...emptyGroup(),
      ...editingGroup,
      id,
      name: editingGroup.name.trim(),
      description: editingGroup.description || "",
      imageUrl: editingGroup.imageUrl || "",
      published: Boolean(editingGroup.published),
      sortOrder: editingGroup.sortOrder ?? groups.length + 1,
    };
    upsertItem("committees", payload);
    setEditingGroup(null);
  };

  const saveMember = (event: FormEvent) => {
    event.preventDefault();
    if (!editingMember?.name?.trim()) return;
    upsertItem("committee", {
      ...emptyMember(),
      ...editingMember,
      name: editingMember.name.trim(),
      committeeId: editingMember.committeeId ? Number(editingMember.committeeId) : null,
    });
    setEditingMember(null);
  };

  const moveMembers = (id: number, direction: -1 | 1) => {
    const ordered = [...members];
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

  const moveGroups = (id: number, direction: -1 | 1) => {
    const ordered = [...groups];
    const index = ordered.findIndex((item) => item.id === id);
    const swap = index + direction;
    if (swap < 0 || swap >= ordered.length) return;
    const current = ordered[index];
    const neighbor = ordered[swap];
    saveCollection(
      "committees",
      groups.map((item) => {
        if (item.id === current.id) return { ...item, sortOrder: neighbor.sortOrder };
        if (item.id === neighbor.id) return { ...item, sortOrder: current.sortOrder };
        return item;
      }),
    );
  };

  const groupName = (id?: number | null) =>
    id == null ? "Unassigned" : groups.find((group) => group.id === id)?.name || "Unknown committee";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Committees</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Create committees, manage leaders, and assign a committee to mission, events, or campaigns.
            Only visible committees appear on the public site.
          </p>
        </div>
        <Button
          className="bg-navy text-white hover:bg-navy-light"
          onClick={() => (tab === "groups" ? setEditingGroup(emptyGroup()) : setEditingMember(emptyMember()))}
        >
          {tab === "groups" ? "Create Committee" : "Add Leader"}
        </Button>
      </div>

      <div className="mb-6 rounded-xl border border-navy/10 bg-white p-4 sm:p-5">
        <Label htmlFor="mission-committee">Homepage Mission Committee</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose which visible committee appears in the public leadership section. Select None to hide it.
        </p>
        <select
          id="mission-committee"
          className="mt-2 flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={state.site.missionCommitteeId == null ? "" : String(state.site.missionCommitteeId)}
          onChange={(event) =>
            updateSite({
              missionCommitteeId: event.target.value ? Number(event.target.value) : null,
            })
          }
        >
          <option value="">None (hide section)</option>
          {groups
            .filter((group) => group.published)
            .map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
        </select>
      </div>

      <div className="mb-6 flex gap-2 border-b border-navy/10 pb-2">
        <Button variant={tab === "groups" ? "default" : "outline"} className={tab === "groups" ? "bg-navy text-white" : ""} onClick={() => setTab("groups")}>
          Committees
        </Button>
        <Button variant={tab === "members" ? "default" : "outline"} className={tab === "members" ? "bg-navy text-white" : ""} onClick={() => setTab("members")}>
          Leaders
        </Button>
      </div>

      {tab === "groups" ? (
        <>
          {editingGroup ? (
            <form onSubmit={saveGroup} className="mb-8 grid gap-4 rounded-xl border border-navy/10 bg-white p-4 sm:p-6 md:grid-cols-2">
              <div>
                <Label>Committee Name</Label>
                <Input
                  className="mt-1.5"
                  required
                  value={editingGroup.name || ""}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  className="mt-1.5"
                  value={editingGroup.description || ""}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                />
              </div>
              <ImageField
                label="Image"
                value={editingGroup.imageUrl || ""}
                onChange={(imageUrl) => setEditingGroup({ ...editingGroup, imageUrl })}
              />
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(editingGroup.published)}
                  onChange={(e) => setEditingGroup({ ...editingGroup, published: e.target.checked })}
                />
                Visible on website
              </label>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" className="bg-navy text-white hover:bg-navy-light">
                  Save Committee
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <article key={group.id} className="overflow-hidden rounded-xl border border-navy/10 bg-white">
                <div className="aspect-[16/10] bg-cream">
                  {group.imageUrl ? (
                    <img src={group.imageUrl} alt="" className={`h-full w-full ${focalObjectClass("center")}`} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-navy/40">No image</div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-navy">{group.name}</h2>
                    <p className="text-xs text-navy/50">
                      {group.published ? "Visible" : "Hidden"} · Display position {group.sortOrder}
                    </p>
                    {group.description ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{group.description}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingGroup(group)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => moveGroups(group.id, -1)}>
                      Up
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => moveGroups(group.id, 1)}>
                      Down
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => upsertItem("committees", { ...group, published: !group.published })}
                    >
                      {group.published ? "Hide" : "Make Visible"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteItem("committees", group.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            {!groups.length ? (
              <p className="col-span-full rounded-xl border border-dashed border-navy/15 bg-white p-6 text-sm text-muted-foreground">
                No committees yet. Create a committee to assign it to mission content, events, or campaigns.
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <>
          {editingMember ? (
            <form onSubmit={saveMember} className="mb-8 grid gap-4 rounded-xl border border-navy/10 bg-white p-4 sm:p-6 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input
                  className="mt-1.5"
                  required
                  value={editingMember.name || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  className="mt-1.5"
                  value={editingMember.position || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, position: e.target.value })}
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  className="mt-1.5"
                  value={editingMember.department || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                />
              </div>
              <div>
                <Label>Assign to Committee</Label>
                <select
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editingMember.committeeId == null ? "" : String(editingMember.committeeId)}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      committeeId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                >
                  {committeeOptions.map((option) => (
                    <option key={option.value || "none"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Bio / role note</Label>
                <Textarea
                  className="mt-1.5"
                  value={editingMember.bio || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                />
              </div>
              <ImageField
                label="Photo"
                value={editingMember.photoUrl || ""}
                onChange={(photoUrl) => setEditingMember({ ...editingMember, photoUrl })}
              />
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(editingMember.isChair)}
                  onChange={(e) => setEditingMember({ ...editingMember, isChair: e.target.checked })}
                />
                Mission chairman
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(editingMember.published)}
                  onChange={(e) => setEditingMember({ ...editingMember, published: e.target.checked })}
                />
                Visible on website
              </label>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" className="bg-navy text-white hover:bg-navy-light">
                  Save Leader
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <article key={member.id} className="rounded-xl border border-navy/10 bg-white p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-md bg-cream">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className={`h-full w-full ${focalObjectClass("top", "contain")}`} />
                    ) : null}
                  </div>
                  <div>
                    <h2 className="font-medium text-navy">{member.name}</h2>
                    <p className="text-xs text-navy/50">
                      {member.position} · {member.department}
                    </p>
                    <p className="text-xs text-navy/40">
                      {member.published ? "Visible" : "Hidden"} · {groupName(member.committeeId)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingMember(member)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => moveMembers(member.id, -1)}>
                    Up
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => moveMembers(member.id, 1)}>
                    Down
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => upsertItem("committee", { ...member, published: !member.published })}
                  >
                    {member.published ? "Hide" : "Make Visible"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteItem("committee", member.id)}>
                    Delete
                  </Button>
                </div>
              </article>
            ))}
            {!members.length ? (
              <p className="col-span-full rounded-xl border border-dashed border-navy/15 bg-white p-6 text-sm text-muted-foreground">
                No leaders yet. Add leaders and assign them to a committee.
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default CommitteePage;
