import { useState } from "react";
import { compressImageToDataUrl as fileToDataUrl } from "@/cms/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ImageField({
  label,
  value,
  onChange,
  maxFileSizeBytes,
  compress = fileToDataUrl,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  maxFileSizeBytes?: number;
  compress?: (file: File) => Promise<string>;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? <img src={value} alt="" className="aspect-video max-h-48 w-full rounded-md bg-cream object-contain" /> : null}
      <Input
        type="text"
        placeholder="Paste an image URL"
        className="min-w-0"
        value={value.startsWith("data:") ? "" : value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Input
        type="file"
        accept="image/*"
        className="min-w-0 max-w-full"
        disabled={busy}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
            toast.error(`Image must be ${maxFileSizeBytes / 1024 / 1024} MB or smaller.`);
            event.target.value = "";
            return;
          }
          setBusy(true);
          try {
            onChange(await compress(file));
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not process the selected image.");
          } finally {
            setBusy(false);
            event.target.value = "";
          }
        }}
      />
    </div>
  );
}
