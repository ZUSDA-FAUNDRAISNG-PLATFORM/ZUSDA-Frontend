import { useState, createContext, useContext, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { submitMpesaDonation, submitMissionaryRegistration, submitPrayerSignup } from "@/api/involvement";

type DialogKind = "pray" | "give" | "go" | null;

const DialogCtx = createContext<{ open: (k: DialogKind) => void; notifyContribution: (amount: number) => void }>({ open: () => {}, notifyContribution: () => {} });

export const useInvolvement = () => useContext(DialogCtx);

const phoneSchema = z.string().trim().regex(/^(?:\+?254|0)?[17]\d{8}$/, "Enter a valid Kenyan phone number");
const emailSchema = z.string().trim().email("Invalid email").max(255);
const nameSchema = z.string().trim().min(2, "Name too short").max(100);

export const InvolvementProvider = ({ children }: { children: ReactNode }) => {
  const [kind, setKind] = useState<DialogKind>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const close = () => setKind(null);

  const notifyContribution = (amount: number) => {
    window.dispatchEvent(new CustomEvent("zusda:contribution", { detail: { amount } }));
    setRefreshTick((v) => v + 1);
  };

  return (
    <DialogCtx.Provider value={{ open: setKind, notifyContribution }}>
      {children}
      <PrayDialog open={kind === "pray"} onClose={close} />
      <GiveDialog open={kind === "give"} onClose={close} />
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
    setForm({ full_name: "", email: "", phone: "", message: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-navy">Join the Prayer Team</DialogTitle>
          <DialogDescription>Stand with us in intercession for Kinungi Mission 2026.</DialogDescription>
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

const GiveDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", amount: "" });
  const { notifyContribution } = useInvolvement();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      phoneSchema.parse(form.phone);
      const amt = Number(form.amount);
      if (!amt || amt < 1) throw new Error("Amount must be at least KES 1");
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? err.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      await submitMpesaDonation({
        donor_name: form.full_name.trim() || "Anonymous",
        phone: form.phone.trim(),
        amount: Number(form.amount),
        project_id: 1,
      });
      notifyContribution(Number(form.amount));
      toast.success("M-Pesa prompt sent! Enter your PIN on your phone to complete the donation.");
      setForm({ full_name: "", phone: "", amount: "" });
      onClose();
    } catch {
      toast.error("Could not record contribution. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-navy">Make a Contribution</DialogTitle>
          <DialogDescription>Your gift fuels the mission. Every shilling reaches souls.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Full Name (optional)</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} /></div>
          <div><Label>M-Pesa Phone Number</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" /></div>
          <div><Label>Amount (KES)</Label><Input required type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="500" /></div>
          <div className="text-xs text-muted-foreground bg-cream rounded-md p-3">
            You can also send directly via M-Pesa Paybill <strong>247247</strong>, Account: <strong>ZUSDA2026</strong>.
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-secondary-foreground hover:opacity-90">
            {loading ? "Processing..." : "Submit Contribution"}
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
          <DialogDescription>Join us in Kinungi, 13–27 December 2026.</DialogDescription>
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
