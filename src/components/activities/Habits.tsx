import { useEffect, useState, type PointerEvent } from "react";
import { ActivityChrome } from "@/components/app/ActivityChrome";
import { SparkleLayer, useSparkles } from "@/components/app/Sparkles";
import { ART, Sprite } from "@/components/art/Sprite";
import { playBrush, playChew, playPop, playSuccess } from "@/lib/audio";
import { PHRASES, say } from "@/lib/speech";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const STEPS = ["brush", "eat", "sleep"] as const;
type Step = (typeof STEPS)[number];

export function HabitsActivity() {
  const lang = useAppStore((s) => s.speechLang);
  const earnStar = useAppStore((s) => s.earnStar);
  const { bursts, spawn } = useSparkles();
  const [step, setStep] = useState<Step>("brush");
  const [done, setDone] = useState<Set<Step>>(new Set());

  useEffect(() => {
    const t = window.setTimeout(() => say(lang, PHRASES[step].ar, PHRASES[step].en), 280);
    return () => window.clearTimeout(t);
  }, [lang, step]);

  const doStep = (want: Step, e: PointerEvent) => {
    e.stopPropagation();
    if (want !== step) {
      say(lang, PHRASES[step].ar, PHRASES[step].en);
      return;
    }
    spawn(e.clientX, e.clientY);
    if (want === "brush") playBrush();
    else if (want === "eat") playChew();
    else playPop();
    const nextDone = new Set(done).add(want);
    setDone(nextDone);
    const idx = STEPS.indexOf(want);
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1]!);
    } else {
      playSuccess();
      say(lang, PHRASES.bravo.ar, PHRASES.bravo.en);
      earnStar("habits");
      window.setTimeout(() => {
        setDone(new Set());
        setStep("brush");
      }, 1600);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-sky" data-testid="activity-habits">
      <div className="absolute inset-x-0 bottom-0 h-[48%] bg-grass" />
      <ActivityChrome title="روتين صديقي" />
      <SparkleLayer bursts={bursts} />
      <div className="absolute inset-x-0 bottom-[22%] top-[12%] mx-auto max-w-xs">
        <img src={ART.bear} alt="" draggable={false} className="h-full w-full object-contain select-none" />
      </div>
      <div className="absolute inset-x-0 bottom-[4%] flex justify-center gap-4 px-3">
        {(
          [
            ["brush", ART.brush, "habit-brush"],
            ["eat", ART.fruit("apple"), "habit-apple"],
            ["sleep", ART.pillow, "habit-pillow"],
          ] as const
        ).map(([id, src, testId]) => (
          <button
            key={id}
            type="button"
            data-testid={testId}
            aria-label={`${PHRASES[id].ar} / ${PHRASES[id].en}`}
            onPointerDown={(e) => doStep(id, e)}
            className={cn(
              "h-24 w-24 sm:h-28 sm:w-28",
              step === id ? "pulse-glow" : "opacity-45",
              done.has(id) && "opacity-20",
            )}
          >
            <Sprite src={src} className="h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
