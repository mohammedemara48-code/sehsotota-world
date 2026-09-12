import type { PointerEvent } from "react";
import { playPop } from "@/lib/audio";
import { useAppStore } from "@/lib/store";

export function ActivityChrome({ title }: { title: string }) {
  const go = useAppStore((s) => s.go);

  const back = (e: PointerEvent) => {
    e.stopPropagation();
    playPop();
    go("hub");
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <button
        type="button"
        data-testid="back-home"
        aria-label="العودة إلى القرية"
        onPointerDown={back}
        className="pointer-events-auto pressable grid size-16 place-items-center rounded-full bg-cream shadow-[0_6px_0_#e4d8c8]"
      >
        <svg viewBox="0 0 48 48" className="size-10" aria-hidden="true">
          <polygon points="24,8 42,24 36,24 36,40 12,40 12,24 6,24" fill="#ff9f7a" stroke="#3e2f2f" strokeWidth="2.4" />
          <rect x="20" y="28" width="8" height="12" fill="#fff6e5" />
        </svg>
      </button>
      <span className="sr-only">{title}</span>
    </div>
  );
}
