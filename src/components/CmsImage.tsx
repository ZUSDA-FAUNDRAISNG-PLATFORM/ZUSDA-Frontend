import type { ImgHTMLAttributes } from "react";

type CmsImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "loading" | "decoding"> & {
  src: string;
  width: number;
  height: number;
};

const CmsImage = ({ src, ...props }: CmsImageProps) => (
  <img {...props} src={src} loading="lazy" decoding="async" />
);

export default CmsImage;
