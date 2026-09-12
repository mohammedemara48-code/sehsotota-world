import { useCallback, useEffect, useState, type PointerEvent } from "react";
import { ActivityChrome } from "@/components/app/ActivityChrome";
import { SparkleLayer, useSparkles } from "@/components/app/Sparkles";
import { ART, Sprite } from "@/components/art/Sprite";
import { playAnimal, playNote, playPop, playSuccess, playWrong } from "@/lib/audio";
import { PHRASES, say } from "@/lib/speech";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Pitch = "high" | "low";

function playPitch(p: Pitch) {
  if (p === "high") {
    playNote(880);
    window.setTimeout(() => playAnimal("bird"), 80);
  } else {
    playNote(120);
    window.setTimeout(() => playAnimal("elephant"), 80);
  }
}

export function MusicActivity() {
  const lang = useAppStore((s) => s.speechLang);
  const earnStar = useAppStore((s) => s.earnStar);
  const { bursts, spawn } = useSparkles();
  const [target, setTarget] = useState<Pitch>("high");
  const [score, setScore] = useState(0);
  const [lock, setLock] = useState(false);
  const [wrong, setWrong] = useState<Pitch | null>(null);

  const ask = useCallback(() => {
    playPitch(target);
  }, [target]);

  useEffect(() => {
    const t = window.setTimeout(ask, 420);
    return () => window.clearTimeout(t);
  }, [ask]);

  const pick = (p: Pitch, e: PointerEvent) => {
    e.stopPropagation();
    if (lock) return;
    if (p === target) {
      playPop();
      playPitch(p);
      say(lang, `${PHRASES.bravo.ar}، ${PHRASES[p].ar}`, `${PHRASES.bravo.en}, ${PHRASES[p].en}`);
      spawn(e.clientX, e.clientY);
      setLock(true);
      const n = score + 1;
      setScore(n);
      if (n >= 5) {
        playSuccess();
        earnStar("music");
      }
      window.setTimeout(() => {
        setTarget(Math.random() < 0.5 ? "high" : "low");
        setLock(false);
      }, 1100);
    } else {
      playWrong();
      setWrong(p);
      say(lang, PHRASES.again.ar, PHRASES.again.en);
      window.setTimeout(() => {
        setWrong(null);
        playPitch(target);
      }, 600);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-sky" data-testid="activity-music" onPointerDown={ask}>
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-grass" />
      <ActivityChrome title="بيت الأصوات" />
      <SparkleLayer bursts={bursts} />
      <div className="absolute inset-x-0 bottom-[10%] top-[18%] flex items-end justify-center gap-6 px-4">
        {(["high", "low"] as const).map((p) => (
          <button
            key={p}
            type="button"
            data-choice="1"
            data-testid={`pitch-${p}`}
            aria-label={PHRASES[p].ar}
            onPointerDown={(e) => pick(p, e)}
            className={cn("h-[70%] w-[42%] max-w-56", wrong === p && "wiggle", lock && p === target && "bounce-in")}
          >
            <Sprite src={ART.animal(p === "high" ? "bird" : "elephant")} className="h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
