import { useCallback, useEffect, useState, type PointerEvent } from "react";
import { ActivityChrome } from "@/components/app/ActivityChrome";
import { SparkleLayer, useSparkles } from "@/components/app/Sparkles";
import { WordFlash } from "@/components/app/WordFlash";
import { ART, Sprite } from "@/components/art/Sprite";
import { playPop, playSuccess, playWrong } from "@/lib/audio";
import { INDIC, NUMBER_NAMES, PHRASES, say, speakNumber } from "@/lib/speech";
import { useAppStore } from "@/lib/store";
import { cn, shuffle } from "@/lib/utils";

function optsFor(n: number) {
  const pool = [1, 2, 3, 4, 5].filter((x) => x !== n);
  return shuffle([n, ...shuffle(pool).slice(0, 2)]);
}

export function NumbersActivity() {
  const lang = useAppStore((s) => s.speechLang);
  const earnStar = useAppStore((s) => s.earnStar);
  const { bursts, spawn } = useSparkles();
  const [n, setN] = useState(2);
  const [choices, setChoices] = useState(() => optsFor(2));
  const [score, setScore] = useState(0);
  const [lock, setLock] = useState(false);
  const [wrong, setWrong] = useState<number | null>(null);

  const ask = useCallback(() => {
    say(lang, PHRASES.howMany.ar, PHRASES.howMany.en);
  }, [lang]);

  useEffect(() => {
    const t = window.setTimeout(ask, 300);
    return () => window.clearTimeout(t);
  }, [ask, n]);

  const pick = (v: number, e: PointerEvent) => {
    e.stopPropagation();
    if (lock) return;
    if (v === n) {
      playPop();
      speakNumber(v, lang);
      spawn(e.clientX, e.clientY);
      setLock(true);
      const nextScore = score + 1;
      setScore(nextScore);
      if (nextScore >= 5) {
        playSuccess();
        earnStar("numbers");
      }
      window.setTimeout(() => {
        const nn = 1 + Math.floor(Math.random() * 5);
        setN(nn);
        setChoices(optsFor(nn));
        setLock(false);
      }, 1400);
    } else {
      playWrong();
      setWrong(v);
      say(lang, `${PHRASES.again.ar}. ${PHRASES.howMany.ar}`, `${PHRASES.again.en}. ${PHRASES.howMany.en}`);
      window.setTimeout(() => setWrong(null), 450);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cream" data-testid="activity-numbers" onPointerDown={ask}>
      <div className="absolute inset-x-0 top-0 h-1/3 bg-sky/70" />
      <ActivityChrome title="بيت الأرقام" />
      <SparkleLayer bursts={bursts} />
      {lock ? <WordFlash ar={NUMBER_NAMES[n]!.ar} en={NUMBER_NAMES[n]!.en} /> : null}
      <div className="absolute inset-x-4 top-[22%] flex flex-wrap items-center justify-center gap-1">
        {Array.from({ length: n }).map((_, i) => (
          <Sprite key={i} src={ART.fruit("apple")} className="h-20 w-16 sm:h-28 sm:w-24" />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-[6%] flex justify-center gap-3">
        {choices.map((v) => (
          <button
            key={v}
            type="button"
            data-choice="1"
            data-testid={`num-${v}`}
            aria-label={`${NUMBER_NAMES[v]!.ar} / ${NUMBER_NAMES[v]!.en}`}
            onPointerDown={(e) => pick(v, e)}
            className={cn(
              "grid size-24 place-items-center rounded-[1.6rem] text-cream shadow-[0_8px_0_rgb(62_47_47_/_0.18)] sm:size-28",
              ["bg-blush", "bg-house-music", "bg-grass", "bg-house-habits", "bg-house-animals"][v - 1],
              wrong === v && "wiggle",
              lock && v === n && "bounce-in",
            )}
          >
            <span className="flex flex-col items-center leading-none">
              <span className="text-4xl font-semibold sm:text-5xl">{v}</span>
              <span className="mt-0.5 text-xl font-semibold opacity-95">{INDIC[v]}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
