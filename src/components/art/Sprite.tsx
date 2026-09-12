import { cn } from "@/lib/utils";

export function Sprite({
  src,
  className,
  imgClass,
}: {
  src: string;
  className?: string;
  imgClass?: string;
}) {
  return (
    <span className={cn("inline-block", className)}>
      <img src={src} alt="" draggable={false} className={cn("h-full w-full object-contain select-none", imgClass)} />
    </span>
  );
}

export const ART = {
  bear: "/art/bear.png",
  brush: "/art/props/brush.png",
  pillow: "/art/props/pillow.png",
  house: (id: string) => `/art/houses/${id}.png`,
  animal: (id: string) => `/art/animals/${id}.png`,
  fruit: (id: string) => `/art/fruits/${id}.png`,
  color: (id: string) => `/art/colors/${id}.png`,
  shape: (id: string) => `/art/shapes/${id}.png`,
};
