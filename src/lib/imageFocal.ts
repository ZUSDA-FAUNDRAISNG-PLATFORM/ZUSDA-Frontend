import type { ImageFocal } from "@/cms/types";
import { cn } from "@/lib/utils";

/** Consistent object-fit + focal-point classes for CMS image cards. */
export function focalObjectClass(focal?: ImageFocal | null, fit: "cover" | "contain" = "cover") {
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";
  switch (focal) {
    case "top":
      return cn(fitClass, "object-top");
    case "bottom":
      return cn(fitClass, "object-bottom");
    case "left":
      return cn(fitClass, "object-left");
    case "right":
      return cn(fitClass, "object-right");
    case "center":
    default:
      return cn(fitClass, "object-center");
  }
}

export const FOCAL_OPTIONS: Array<{ value: ImageFocal; label: string }> = [
  { value: "center", label: "Center" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];
