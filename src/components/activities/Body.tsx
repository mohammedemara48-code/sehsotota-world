import { useCallback, useEffect, useState, type PointerEvent } from "react";
import { ActivityChrome } from "@/components/app/ActivityChrome";
import { SparkleLayer, useSparkles } from "@/components/app/Sparkles";
import { WordFlash } from "@/components/app/WordFlash";
import { ART } from "@/components/art/Sprite";
import { playPop, playSuccess, playWrong } from "@/lib/audio";
import { BODY_NAMES, PHRASES, say } from "@/lib/speech";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const PARTS = ["head", "hand", "belly", "foot"] as const;
type Part = (typeof PARTS)[number];

const ZONES: { id: Part; style: string }[] = [
  { id: "head", style: "left-[28%] top-[8%] h-[28%] w-[44%]" },
  { id: "hand", style: "left-[62%] top-[20%] h-[22%] w-[34%]" },
  { id: "belly", style: "left-[32%] top-[42%] h-[26%] w-[36%]" },
  { id: "foot", style: "left-[26%] top-[78%] h-[20%] w-[48%]" },
];

export function BodyActivity() {
  const lang = useAppStore((s) => s.speechLang);
  const earnStar = useAppStore((s) => s.earnStar);
  const { bursts, spawn } = useSparkles();
  const [target, setTarget] = useState<Part>("head");
  const [score, setScore] = useState(0);
  const [lock, setLock] = useState(false);
  const [flash, setFlash] = useState<Part | null>(null);

  const ask = useCallback(() => {
    say(lang, PHRASES.where.ar(BODY_NAMES[target]!.ar), PHRASES.where.en(BODY_NAMES[target]!.en));
  }, [lang, target]);

  useEffect(() => {
    const t = window.setTimeout(ask, 300);
    return () => window.clearTimeout(t);
  }, [ask]);

  const pick = (part: Part, e: PointerEvent) => {
    e.stopPropagation();
    if (lock) return;
    if (part === target) {
      playPop();
      say(lang, `${PHRASES.bravo.ar}، ${BODY_NAMES[part]!.ar}`, `${PHRASES.bravo.en}, ${BODY_NAMES[part]!.en}`);
      spawn(e.clientX, e.clientY);
      setFlash(part);
      setLock(true);
      const n = score + 1;
      setScore(n);
      if (n >= 5) {
        playSuccess();
        earnStar("body");
      }
      window.setTimeout(() => {
        const next = PARTS.filter((p) => p !== part)[Math.floor(Math.random() * 3)]!;
        setTarget(next);
        setFlash(null);
        setLock(false);
      }, 1000);
    } else {
      playWrong();
      say(
        lang,
        `${PHRASES.again.ar}. ${PHRASES.where.ar(BODY_NAMES[target]!.ar)}`,
        `${PHRASES.again.en}. ${PHRASES.where.en(BODY_NAMES[target]!.en)}`,
      );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-sky" data-testid="activity-body" onPointerDown={ask}>
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-grass" />
      <ActivityChrome title="جسم صديقي" />
      <SparkleLayer bursts={bursts} />
      {lock ? <WordFlash ar={BODY_NAMES[target]!.ar} en={BODY_NAMES[target]!.en} /> : null}
      <div className="absolute inset-x-0 bottom-[4%] top-[12%] mx-auto max-w-sm">
        <img src={ART.bear} alt="" draggable={false} className="h-full w-full object-contain select-none" />
        {ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            data-choice="1"
            data-testid={`body-${z.id}`}
            aria-label={BODY_NAMES[z.id]!.ar}
            onPointerDown={(e) => pick(z.id, e)}
            className={cn("absolute", z.style, flash === z.id && "rounded-full ring-4 ring-sun")}
          />
        ))}
      </div>
    </div>
  );
}
