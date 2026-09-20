import { FormEvent, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { SimpleResourcePage } from "@/components/admin/SimpleResourcePage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ValuesPage = () => {
  const { state, updateSite } = useCms();
  const [form, setForm] = useState({
    missionTitle: state.site.missionTitle,
    missionBody: state.site.missionBody,
    visionTitle: state.site.visionTitle,
    visionBody: state.site.visionBody,
  });

  const save = (event: FormEvent) => {
    event.preventDefault();
    updateSite(form);
  };

  return (
    <div className="space-y-10">
      <form onSubmit={save} className="max-w-3xl space-y-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Mission, vision & values</h1>
          <p className="text-sm text-muted-foreground">Update the About section copy. Changes publish immediately.</p>
        </div>
        <div>
          <Label>Mission title</Label>
          <Input className="mt-1.5" value={form.missionTitle} onChange={(e) => setForm({ ...form, missionTitle: e.target.value })} />
        </div>
        <div>
          <Label>Mission</Label>
          <Textarea className="mt-1.5" rows={4} value={form.missionBody} onChange={(e) => setForm({ ...form, missionBody: e.target.value })} />
        </div>
        <div>
          <Label>Vision title</Label>
          <Input className="mt-1.5" value={form.visionTitle} onChange={(e) => setForm({ ...form, visionTitle: e.target.value })} />
        </div>
        <div>
          <Label>Vision</Label>
          <Textarea className="mt-1.5" rows={4} value={form.visionBody} onChange={(e) => setForm({ ...form, visionBody: e.target.value })} />
        </div>
        <Button type="submit" className="bg-navy text-white hover:bg-navy-light">Save mission & vision</Button>
      </form>
      <SimpleResourcePage
        title="Core values"
        description="These cards appear under Mission and Vision on the homepage."
        collection="values"
        defaults={{ title: "", description: "", icon: "heart" }}
        fields={[
          { key: "title", label: "Title" },
          { key: "icon", label: "Icon (book, heart, users, or cross)" },
          { key: "description", label: "Description", type: "textarea" },
        ]}
        preview={(item) => item.title}
      />
    </div>
  );
};

export default ValuesPage;
