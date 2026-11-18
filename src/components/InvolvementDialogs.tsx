import { useState, createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { submitMissionaryRegistration, submitPrayerSignup } from "@/api/involvement";

type DialogKind = "pray" | "give" | "go" | null;

export interface GiveOptions {
  /** Explicit flow. Defaults to general when omitted. */
  mode?: "campaign" | "general";
  projectId?: number | null;
  causeName?: string | null;
  posterId?: number | null;
}

const DialogCtx = createContext<{
  open: (k: DialogKind, options?: GiveOptions) => void;
  notifyContribution: (amount: number, seed?: string) => void;
}>({ open: () => {}, notifyContribution: () => {} });

export const useInvolvement = () => useContext(DialogCtx);

const phoneSchema = z.string().trim().regex(/^(?:\+?254|0)?[17]\d{8}$/, "Enter a valid Kenyan phone number");
const emailSchema = z.string().trim().email("Invalid email").max(255);
const nameSchema = z.string().trim().min(2, "Name too short").max(100);

export const InvolvementProvider = ({ children }: { children: ReactNode }) => {
  const [kind, setKind] = useState<DialogKind>(null);
  const navigate = useNavigate();

  const close = () => setKind(null);

  const open = (k: DialogKind, options?: GiveOptions) => {
    if (k === "give") {
      const mode = options?.mode === "campaign" ? "campaign" : "general";
      const params = new URLSearchParams();
      params.set("mode", mode);
      if (mode === "campaign") {
        if (options?.projectId != null) params.set("projectId", String(options.projectId));
        if (options?.posterId != null) params.set("posterId", String(options.posterId));
        if (options?.causeName) params.set("cause", options.causeName);
      }
      navigate(`/give?${params.toString()}`);
      return;
    }
    setKind(k);
  };

  const notifyContribution = (amount: number, seed?: string) => {
    window.dispatchEvent(new CustomEvent("zusda:contribution", { detail: { amount, seed } }));
  };

  return (
    <DialogCtx.Provider value={{ open, notifyContribution }}>
      {children}
      <PrayDialog open={kind === "pray"} onClose={close} />
      <GoDialog open={kind === "go"} onClose={close} />
    </DialogCtx.Provider>
  );
};

const PrayDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(form.full_name);
      emailSchema.parse(form.email);
      if (form.phone) phoneSchema.parse(form.phone);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      await submitPrayerSignup({
        fullName: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        message: form.message.trim() || null,
      });
      toast.success("Thank you for joining the prayer team!");
      setForm({ full_name: "", email: "", phone: "", message: "" });
      onClose();
    } catch {
      toast.error("Could not submit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-navy">Join the Prayer Team</DialogTitle>
          <DialogDescription>Stand with us in intercession for Kinamba Mission 2026.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Full Name</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} /></div>
          <div><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} /></div>
          <div><Label>Phone (optional)</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" /></div>
          <div><Label>Prayer Request / Message (optional)</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={1000} rows={3} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy-light text-primary-foreground">
            {loading ? "Submitting..." : "Commit to Pray"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const GoDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", church: "", age: "", notes: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(form.full_name);
      emailSchema.parse(form.email);
      phoneSchema.parse(form.phone);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      await submitMissionaryRegistration({
        fullName: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        church: form.church.trim() || null,
        age: form.age ? Number(form.age) : null,
        notes: form.notes.trim() || null,
      });
      toast.success("Registered! We'll be in touch with mission details.");
      setForm({ full_name: "", email: "", phone: "", church: "", age: "", notes: "" });
      onClose();
    } catch {
      toast.error("Could not register. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-navy">Register to Go</DialogTitle>
          <DialogDescription>Join us in Kinamba, 13–27 December 2026.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Full Name</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} /></div>
          <div><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} /></div>
          <div><Label>Phone</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Church (optional)</Label><Input value={form.church} onChange={(e) => setForm({ ...form, church: e.target.value })} maxLength={100} /></div>
            <div><Label>Age (optional)</Label><Input type="number" min={10} max={120} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
          </div>
          <div><Label>Notes / Skills (optional)</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} rows={3} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy-light text-primary-foreground">
            {loading ? "Submitting..." : "Register Me"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
