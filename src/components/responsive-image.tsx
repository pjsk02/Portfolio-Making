import type { ImgHTMLAttributes } from "react";
import { img } from "@/data";

// Keep originals available for large, high-density displays. Smaller screens
// receive pre-sized WebP files rather than decoding the original screenshots.
const variants: Record<string, { name: string; width: number; height: number }> = {
  "xiuWhxxcqu2iekfpMQyPLV8Cw-7ab020c1b1b4dcbf.jpeg": { name: "medfind", width: 1280, height: 708 },
  "yVU0FPlyVDfDOI6HX1qDJ6aDFQ-24e52203f3a46d49.png": { name: "tripsync", width: 1458, height: 991 },
  "OnaQm12gILMypvgAQ0wolxyx7jU-72dc1c73c71ad5f5.png": { name: "momcart", width: 1915, height: 900 },
  "ucLQZDraSrNWJ6KMJqvq8c3wOXs-6a9045ea5ff1ee97.png": { name: "solarsketch", width: 1513, height: 853 },
  "bdrre6QbmVmN35X1haIcqJYr0w-605a7a7c98707b35.png": { name: "nypd", width: 1658, height: 840 },
  "LKDZ7TFowHgdOBNyrSNkGE4AAZU-d5145d4851d17404.png": { name: "airline", width: 1920, height: 942 },
};

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "alt" | "sizes"> & {
  file: string;
  alt: string;
  sizes: string;
};

export function ResponsiveImage({ file, alt, sizes, loading = "lazy", ...props }: Props) {
  const asset = variants[file];
  const srcSet = asset
    ? [...[160, 480, 800, 1200].map((w) => `${img(`responsive/${asset.name}-${w}.webp`)} ${w}w`), `${img(file)} ${asset.width}w`].join(", ")
    : undefined;
  return <img {...props} src={asset ? img(`responsive/${asset.name}-800.webp`) : img(file)}
    srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt={alt}
    width={props.width ?? asset?.width} height={props.height ?? asset?.height}
    loading={loading} decoding="async" />;
}
