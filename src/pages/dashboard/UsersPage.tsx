import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useCms } from "@/cms/CmsProvider";
import { hashPassword } from "@/cms/utils";
import type { CmsUser, UserRole } from "@/cms/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyForm = {
  name: "",
  email: "",
  username: "",
  password: "",
};

const UsersPage = () => {
  const { state, setUsers, addUser } = useCms();
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const taken = (username: string, exceptId?: number) =>
    state.users.some(
      (user) => user.username.toLowerCase() === username.trim().toLowerCase() && user.id !== exceptId,
    );

  const setRole = (id: number, role: UserRole) => {
    const current = state.users.find((user) => user.id === id);
    if (!current) return;
    const admins = state.users.filter((user) => user.role === "admin");
    if (current.role === "admin" && role === "member" && admins.length === 1) {
      toast.error("Keep at least one administrator.");
      return;
    }
    setUsers(state.users.map((user) => (user.id === id ? { ...user, role } : user)));
    toast.success(`${current.name} is now a ${role === "admin" ? "administrator" : "member"}.`);
  };

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
  };

  const openEdit = (user: CmsUser) => {
    setMode("edit");
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, username: user.username, password: "" });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const username = form.username.trim();
    if (!name || !username) {
      toast.error("Name and username are required.");
      return;
    }
    if (mode === "create" && form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (mode === "edit" && form.password && form.password.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (taken(username, editingId ?? undefined)) {
      toast.error("That username is already taken.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        addUser({
          name,
          email,
          username,
          passwordHash: await hashPassword(form.password),
          role: "admin",
        });
        toast.success("Administrator added. Share the username and password privately.");
      } else if (editingId) {
        const current = state.users.find((user) => user.id === editingId);
        if (!current) return;
        const passwordHash = form.password ? await hashPassword(form.password) : current.passwordHash;
        setUsers(
          state.users.map((user) =>
            user.id === editingId ? { ...user, name, email, username, passwordHash } : user,
          ),
        );
        toast.success(form.password ? "Login details updated." : "Administrator profile updated.");
      }
      setMode("closed");
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Users</h1>
          <p className="text-sm text-muted-foreground">
            Add administrators and set their usernames and passwords. Members can register themselves, but only admins can edit the site.
          </p>
        </div>
        <Button className="bg-navy text-white hover:bg-navy-light" onClick={openCreate}>
          Add administrator
        </Button>
      </div>

      {mode !== "closed" ? (
        <form onSubmit={save} className="mb-8 grid gap-4 rounded-xl border border-navy/10 bg-white p-4 sm:grid-cols-2 sm:p-6">
          <p className="font-medium text-navy sm:col-span-2">
            {mode === "create" ? "New administrator" : "Update login details"}
          </p>
          <div>
            <Label>Full name</Label>
            <Input className="mt-1.5" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1.5" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Username</Label>
            <Input className="mt-1.5" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <Label>{mode === "edit" ? "New password (leave blank to keep current)" : "Password"}</Label>
            <Input
              className="mt-1.5"
              type="password"
              minLength={mode === "create" ? 6 : undefined}
              required={mode === "create"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={saving} className="bg-navy text-white hover:bg-navy-light">
              {saving ? "Saving…" : mode === "create" ? "Create administrator" : "Save credentials"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setMode("closed")}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-navy/10 bg-cream">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.users.map((user) => (
              <tr key={user.id} className="border-b border-navy/5">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={user.role === "admin" ? "default" : "outline"} onClick={() => setRole(user.id, "admin")}>
                      Admin
                    </Button>
                    <Button size="sm" variant={user.role === "member" ? "default" : "outline"} onClick={() => setRole(user.id, "member")}>
                      Member
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                    Change credentials
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
