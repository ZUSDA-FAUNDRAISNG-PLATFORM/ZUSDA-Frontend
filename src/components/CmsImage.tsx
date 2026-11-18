import type { ImgHTMLAttributes } from "react";

type CmsImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "decoding"> & {
  src: string;
  width: number;
  height: number;
  /** Defaults to lazy; pass "eager" for above-the-fold / first-card images. */
  loading?: "lazy" | "eager";
};

/**
 * Shared CMS image element.
 * Callers control loading priority — forcing lazy inside opacity/transform
 * animations previously caused the first event card image to never paint.
 */
const CmsImage = ({ src, loading = "lazy", ...props }: CmsImageProps) => (
  <img {...props} src={src} loading={loading} decoding="async" />
);

export default CmsImage;
