import { useState } from "react";
import { fileToDataUrl } from "@/cms/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? <img src={value} alt="" className="h-28 w-full rounded-md object-cover" /> : null}
      <Input
        type="text"
        placeholder="Paste an image URL"
        value={value.startsWith("data:") ? "" : value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            onChange(await fileToDataUrl(file));
          } finally {
            setBusy(false);
            event.target.value = "";
          }
        }}
      />
    </div>
  );
}
