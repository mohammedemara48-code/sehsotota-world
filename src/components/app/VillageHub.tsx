import type { PointerEvent } from "react";
import { playPop } from "@/lib/audio";
import { HOUSES, useAppStore, type HouseId } from "@/lib/store";
import { HouseArt } from "@/components/art/Houses";
import { LangToggle } from "./LangToggle";
import { Hills, SkyDecor } from "./Sky";

export function VillageHub() {
  const go = useAppStore((s) => s.go);
  const stars = useAppStore((s) => s.stars);
  const allStarred = HOUSES.every((h) => stars[h.id]);

  const open = (id: HouseId) => (e: PointerEvent) => {
    e.stopPropagation();
    playPop();
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(18);
    go(id);
  };

  return (
    <div className="absolute inset-0" data-testid="village-hub">
      <SkyDecor rainbow={allStarred} />
      <Hills />
      <div className="absolute inset-x-0 top-[max(0.6rem,env(safe-area-inset-top))] z-20 px-14">
        <LangToggle />
      </div>
      <div className="village-grid absolute inset-x-0 bottom-0 top-[12%] z-10 px-2 pb-2 sm:px-5 sm:pb-3">
        {HOUSES.map((h) => (
          <button
            key={h.id}
            type="button"
            data-testid={`house-${h.id}`}
            aria-label={`${h.labelAr} / ${h.labelEn}`}
            onPointerDown={open(h.id)}
            className="house-hit pulse-glow"
          >
            <HouseArt id={h.id} starred={stars[h.id]} />
            <span className="nameplate">
              <span className="block text-[13px] leading-none font-semibold">{h.labelAr}</span>
              <span className="mt-0.5 block text-[10px] leading-none font-bold tracking-wide text-ink-soft">
                {h.labelEn}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
