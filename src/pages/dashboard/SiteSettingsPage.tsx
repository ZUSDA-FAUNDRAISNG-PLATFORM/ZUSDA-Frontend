import { FormEvent, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import type { SiteSettings } from "@/cms/types";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SiteSettingsPage = () => {
  const { state, updateSite } = useCms();
  const [form, setForm] = useState<SiteSettings>(state.site);

  const save = (event: FormEvent) => {
    event.preventDefault();
    updateSite(form);
  };

  const set = (key: keyof SiteSettings, value: string) => setForm({ ...form, [key]: value });

  return (
    <form onSubmit={save} className="max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-bold text-navy">Site settings</h1>
      <p className="text-sm text-muted-foreground">Hero, about, CTA, and footer copy used across the public website.</p>
      {[
        ["churchName", "Church name"],
        ["tagline", "Tagline"],
        ["heroEyebrow", "Hero eyebrow"],
        ["heroTitle", "Hero title"],
        ["heroSubtitle", "Hero subtitle"],
        ["heroMeta", "Hero meta line"],
        ["countdownDate", "Countdown date"],
        ["aboutEyebrow", "About eyebrow"],
        ["aboutTitle", "About title"],
        ["contactEmail", "Email"],
        ["chairmanName", "Chairman name"],
        ["chairmanPhone", "Chairman phone"],
        ["elderName", "Elder name"],
        ["elderPhone", "Elder phone"],
      ].map(([key, label]) => (
        <div key={key}>
          <Label>{label}</Label>
          <Input className="mt-1.5" value={String(form[key as keyof SiteSettings])} onChange={(e) => set(key as keyof SiteSettings, e.target.value)} />
        </div>
      ))}
      <div>
        <Label>About body</Label>
        <Textarea className="mt-1.5" rows={5} value={form.aboutBody} onChange={(e) => set("aboutBody", e.target.value)} />
      </div>
      <div>
        <Label>CTA title (use new lines)</Label>
        <Textarea className="mt-1.5" value={form.ctaTitle} onChange={(e) => set("ctaTitle", e.target.value)} />
      </div>
      <div>
        <Label>CTA body</Label>
        <Textarea className="mt-1.5" value={form.ctaBody} onChange={(e) => set("ctaBody", e.target.value)} />
      </div>
      <div>
        <Label>Footer blurb</Label>
        <Textarea className="mt-1.5" value={form.footerBlurb} onChange={(e) => set("footerBlurb", e.target.value)} />
      </div>
      <ImageField label="Hero image" value={form.heroImageUrl} onChange={(heroImageUrl) => setForm({ ...form, heroImageUrl })} />
      <ImageField label="CTA background" value={form.ctaImageUrl} onChange={(ctaImageUrl) => setForm({ ...form, ctaImageUrl })} />
      <Button type="submit" className="bg-navy text-white hover:bg-navy-light">Save settings</Button>
    </form>
  );
};

export default SiteSettingsPage;
