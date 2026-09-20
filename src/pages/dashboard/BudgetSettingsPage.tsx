import { FormEvent, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const BudgetSettingsPage = () => {
  const { state, updateSite } = useCms();
  const [form, setForm] = useState({
    budgetGoal: String(state.site.budgetGoal || 416000),
    paybill: state.site.paybill || "",
    paybillAccount: state.site.paybillAccount || "",
    wordOfFaith: state.site.wordOfFaith || "",
  });

  const save = (event: FormEvent) => {
    event.preventDefault();
    const budgetGoal = Number(form.budgetGoal);
    if (!budgetGoal || budgetGoal < 1) return;
    updateSite({
      budgetGoal,
      paybill: form.paybill.trim(),
      paybillAccount: form.paybillAccount.trim(),
      wordOfFaith: form.wordOfFaith.trim(),
    });
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Mission budget</h1>
        <p className="text-sm text-muted-foreground">
          Update the goal, paybill, and word of faith. Progress, percentage, and the next milestone update automatically from contributions.
        </p>
      </div>
      <div>
        <Label>Mission budget goal (KSH)</Label>
        <Input className="mt-1.5" type="number" min={1} required value={form.budgetGoal} onChange={(e) => setForm({ ...form, budgetGoal: e.target.value })} />
      </div>
      <div>
        <Label>Paybill</Label>
        <Input className="mt-1.5" required value={form.paybill} onChange={(e) => setForm({ ...form, paybill: e.target.value })} />
      </div>
      <div>
        <Label>Account number</Label>
        <Input className="mt-1.5" required value={form.paybillAccount} onChange={(e) => setForm({ ...form, paybillAccount: e.target.value })} />
      </div>
      <div>
        <Label>A word of faith</Label>
        <Textarea className="mt-1.5" rows={4} value={form.wordOfFaith} onChange={(e) => setForm({ ...form, wordOfFaith: e.target.value })} />
      </div>
      <Button type="submit" className="bg-navy text-white hover:bg-navy-light">Save budget settings</Button>
    </form>
  );
};

export default BudgetSettingsPage;
