import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ActivityChrome } from "@/components/app/ActivityChrome";
import { SparkleLayer, useSparkles } from "@/components/app/Sparkles";
import { ART, Sprite } from "@/components/art/Sprite";
import { playPop, playSuccess, playWrong } from "@/lib/audio";
import { PHRASES, SHAPE_NAMES, say } from "@/lib/speech";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const KINDS = ["circle", "square", "triangle", "star"] as const;
type ShapeKind = (typeof KINDS)[number];

type Drag = { kind: ShapeKind; pointerId: number; x: number; y: number };

export function ShapesActivity() {
  const bins = useRef<Partial<Record<ShapeKind, HTMLButtonElement | null>>>({});
  const [placed, setPlaced] = useState<Record<ShapeKind, boolean>>({
    circle: false,
    square: false,
    triangle: false,
    star: false,
  });
  const [drag, setDrag] = useState<Drag | null>(null);
  const [wiggle, setWiggle] = useState<ShapeKind | null>(null);
  const { bursts, spawn } = useSparkles();
  const earnStar = useAppStore((s) => s.earnStar);
  const lang = useAppStore((s) => s.speechLang);

  const nextGoal = KINDS.find((k) => !placed[k]);

  useEffect(() => {
    if (!nextGoal) return;
    const t = window.setTimeout(
      () => say(lang, PHRASES.putShape.ar(SHAPE_NAMES[nextGoal]!.ar), PHRASES.putShape.en(SHAPE_NAMES[nextGoal]!.en)),
      320,
    );
    return () => window.clearTimeout(t);
  }, [lang, nextGoal]);

  const onDown = (kind: ShapeKind) => (e: PointerEvent<HTMLButtonElement>) => {
    if (placed[kind]) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    say(lang, SHAPE_NAMES[kind]!.ar, SHAPE_NAMES[kind]!.en);
    setDrag({ kind, pointerId: e.pointerId, x: e.clientX, y: e.clientY });
  };

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
  };

  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const kind = drag.kind;
    setDrag(null);
    const hitKind = KINDS.find((k) => {
      const rect = bins.current[k]?.getBoundingClientRect();
      return (
        rect &&
        e.clientX > rect.left - 28 &&
        e.clientX < rect.right + 28 &&
        e.clientY > rect.top - 28 &&
        e.clientY < rect.bottom + 28
      );
    });
    if (hitKind === kind) {
      playPop();
      spawn(e.clientX, e.clientY);
      say(lang, `${PHRASES.bravo.ar}، ${SHAPE_NAMES[kind]!.ar}`, `${PHRASES.bravo.en}, ${SHAPE_NAMES[kind]!.en}`);
      const next = { ...placed, [kind]: true };
      setPlaced(next);
      if (KINDS.every((k) => next[k])) {
        playSuccess();
        earnStar("shapes");
        window.setTimeout(() => {
          setPlaced({ circle: false, square: false, triangle: false, star: false });
        }, 1600);
      }
    } else {
      playWrong();
      setWiggle(kind);
      say(lang, PHRASES.again.ar, PHRASES.again.en);
      window.setTimeout(() => setWiggle(null), 420);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cream" data-testid="activity-shapes">
      <div className="absolute inset-x-0 top-0 h-2/5 bg-sky/80" />
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-grass" />
      <ActivityChrome title="بيت الأشكال" />
      <SparkleLayer bursts={bursts} />
      <div className="absolute inset-x-0 bottom-[28%] flex justify-center gap-2 px-2 sm:gap-5">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            ref={(el) => {
              bins.current[k] = el;
            }}
            data-testid={`bin-${k}`}
            aria-label={SHAPE_NAMES[k]!.ar}
            className="grid h-24 w-[22%] max-w-28 place-items-center rounded-t-2xl bg-wood-deep p-1 sm:h-32"
          >
            <Sprite src={ART.shape(k)} className={cn("w-[90%]", placed[k] ? "opacity-100" : "opacity-30")} />
          </button>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-[4%] flex justify-center gap-3">
        {KINDS.map((k) =>
          placed[k] ? (
            <div key={k} className="size-20 sm:size-24" />
          ) : (
            <button
              key={k}
              type="button"
              data-testid={`shape-${k}`}
              aria-label={SHAPE_NAMES[k]!.ar}
              onPointerDown={onDown(k)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              className={cn("size-20 touch-none sm:size-24", wiggle === k && "wiggle", drag?.kind === k && "opacity-30")}
            >
              <Sprite src={ART.shape(k)} className="h-full w-full" />
            </button>
          ),
        )}
      </div>
      {drag ? (
        <div
          className="pointer-events-none absolute z-20 size-20 -translate-x-1/2 -translate-y-1/2 sm:size-24"
          style={{ left: drag.x, top: drag.y }}
        >
          <Sprite src={ART.shape(drag.kind)} className="h-full w-full" />
        </div>
      ) : null}
    </div>
  );
}
