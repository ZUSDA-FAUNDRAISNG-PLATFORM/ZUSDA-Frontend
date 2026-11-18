import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "@/cms/CmsProvider";
import type { SiteSettings } from "@/cms/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const HeroContentPage = () => {
  const { state, updateSite } = useCms();
  const [form, setForm] = useState({
    heroEyebrow: state.site.heroEyebrow,
    heroTitle: state.site.heroTitle,
    heroTitleHighlight: state.site.heroTitleHighlight || "",
    heroSubtitle: state.site.heroSubtitle,
    heroPrimaryButtonText: state.site.heroPrimaryButtonText || "",
    heroPrimaryButtonLink: state.site.heroPrimaryButtonLink || "",
    heroSecondaryButtonText: state.site.heroSecondaryButtonText || "",
    heroSecondaryButtonLink: state.site.heroSecondaryButtonLink || "",
    heroExploreLinkText: state.site.heroExploreLinkText || "",
    heroExploreLink: state.site.heroExploreLink || "",
  });

  useEffect(() => {
    setForm({
      heroEyebrow: state.site.heroEyebrow,
      heroTitle: state.site.heroTitle,
      heroTitleHighlight: state.site.heroTitleHighlight || "",
      heroSubtitle: state.site.heroSubtitle,
      heroPrimaryButtonText: state.site.heroPrimaryButtonText || "",
      heroPrimaryButtonLink: state.site.heroPrimaryButtonLink || "",
      heroSecondaryButtonText: state.site.heroSecondaryButtonText || "",
      heroSecondaryButtonLink: state.site.heroSecondaryButtonLink || "",
      heroExploreLinkText: state.site.heroExploreLinkText || "",
      heroExploreLink: state.site.heroExploreLink || "",
    });
  }, [state.site]);

  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const save = (event: FormEvent) => {
    event.preventDefault();
    updateSite(form as Partial<SiteSettings>);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark">Homepage</p>
        <h1 className="font-display text-3xl font-bold text-navy">Hero Content</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit the static left side of the homepage hero. The image card is managed under{" "}
          <Link to="/dashboard/homepage/highlights" className="font-medium text-navy underline-offset-2 hover:underline">
            Homepage Highlights
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={save} className="space-y-4 rounded-xl border border-navy/10 bg-white p-5 sm:p-6">
          {(
            [
              ["heroEyebrow", "Small Label"],
              ["heroTitle", "Main Heading"],
              ["heroTitleHighlight", "Highlighted Heading Text"],
              ["heroPrimaryButtonText", "Primary Button Text"],
              ["heroPrimaryButtonLink", "Primary Button Link"],
              ["heroSecondaryButtonText", "Secondary Button Text"],
              ["heroSecondaryButtonLink", "Secondary Button Link"],
              ["heroExploreLinkText", "Explore Link Text"],
              ["heroExploreLink", "Explore Link"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input id={key} className="mt-1.5" value={form[key]} onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
          <div>
            <Label htmlFor="heroSubtitle">Description</Label>
            <Textarea
              id="heroSubtitle"
              className="mt-1.5"
              rows={4}
              value={form.heroSubtitle}
              onChange={(e) => set("heroSubtitle", e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: use <code className="rounded bg-navy/5 px-1">give</code>, <code className="rounded bg-navy/5 px-1">pray</code>,{" "}
            <code className="rounded bg-navy/5 px-1">/give?mode=general</code>, or <code className="rounded bg-navy/5 px-1">#campaigns</code> for
            links.
          </p>
          <Button type="submit" className="bg-navy text-white hover:bg-navy-light">
            Save Hero Content
          </Button>
        </form>

        <div className="rounded-xl border border-navy/10 bg-[#F7F8FC] p-5 sm:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold-dark">Live preview</p>
          <p className="section-eyebrow">{form.heroEyebrow || "Small label"}</p>
          <h2 className="font-display text-3xl font-bold leading-tight text-heading">
            {form.heroTitle || "Main heading"}
            {form.heroTitleHighlight ? (
              <span className="block text-gold-dark"> {form.heroTitleHighlight}</span>
            ) : null}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-body">
            {form.heroSubtitle || "Description appears here."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <span className="btn-gold pointer-events-none w-fit">{form.heroPrimaryButtonText || "Primary"}</span>
            <span className="btn-secondary pointer-events-none w-fit">{form.heroSecondaryButtonText || "Secondary"}</span>
            <span className="text-sm font-semibold text-heading underline">{form.heroExploreLinkText || "Explore"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContentPage;
