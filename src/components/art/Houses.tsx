import { cn } from "@/lib/utils";
import type { HouseId } from "@/lib/store";
import { ART } from "./Sprite";

export function HouseArt({ id, starred, className }: { id: HouseId; starred?: boolean; className?: string }) {
  return (
    <span className={cn("relative flex h-full w-full items-end justify-center", className)}>
      <img
        src={ART.house(id)}
        alt=""
        draggable={false}
        className="max-h-full w-auto max-w-[92%] object-contain object-bottom select-none"
      />
      {starred ? (
        <svg viewBox="0 0 40 40" className="pop-in absolute top-0 right-[8%] w-[28%] drop-shadow-sm" aria-hidden="true">
          <polygon
            points="20,2 24,14 38,15 27,23 31,36 20,28 9,36 13,23 2,15 16,14"
            fill="#ffd166"
            stroke="#e09f1f"
            strokeWidth="2"
          />
        </svg>
      ) : null}
    </span>
  );
}
