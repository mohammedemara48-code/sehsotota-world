import { useCallback, useEffect, useState, type PointerEvent } from "react";
import { ActivityChrome } from "@/components/app/ActivityChrome";
import { SparkleLayer, useSparkles } from "@/components/app/Sparkles";
import { WordFlash } from "@/components/app/WordFlash";
import { Sprite } from "@/components/art/Sprite";
import { playPop, playSuccess, playWrong } from "@/lib/audio";
import { PHRASES, say } from "@/lib/speech";
import { useAppStore, type HouseId } from "@/lib/store";
import { cn, shuffle } from "@/lib/utils";

export type LessonItem = {
  id: string;
  src?: string;
  glyph?: string;
  tint?: string;
  ar: string;
  en: string;
};

type Round = { target: LessonItem; options: LessonItem[] };

function nextRound(items: LessonItem[], avoid?: string): Round {
  const pool = avoid && items.length > 1 ? items.filter((i) => i.id !== avoid) : items;
  const target = pool[Math.floor(Math.random() * pool.length)]!;
  const rest = shuffle(items.filter((i) => i.id !== target.id)).slice(0, 2);
  return { target, options: shuffle([target, ...rest]) };
}

export function FindLesson({
  houseId,
  title,
  testId,
  items,
  prompt,
  onCorrect,
  className,
}: {
  houseId: HouseId;
  title: string;
  testId: string;
  items: LessonItem[];
  prompt: { ar: (name: string) => string; en: (name: string) => string };
  onCorrect?: (id: string) => void;
  className?: string;
}) {
  const lang = useAppStore((s) => s.speechLang);
  const earnStar = useAppStore((s) => s.earnStar);
  const { bursts, spawn } = useSparkles();
  const [round, setRound] = useState<Round>(() => nextRound(items));
  const [score, setScore] = useState(0);
  const [lock, setLock] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);

  const ask = useCallback(() => {
    say(lang, prompt.ar(round.target.ar), prompt.en(round.target.en));
  }, [lang, prompt, round.target]);

  useEffect(() => {
    const t = window.setTimeout(ask, 280);
    return () => window.clearTimeout(t);
  }, [ask]);

  const pick = (item: LessonItem, e: PointerEvent) => {
    e.stopPropagation();
    if (lock) return;
    if (item.id === round.target.id) {
      playPop();
      onCorrect?.(item.id);
      say(lang, `${PHRASES.bravo.ar}، ${item.ar}`, `${PHRASES.bravo.en}, ${item.en}`);
      spawn(e.clientX, e.clientY);
      setLock(true);
      const n = score + 1;
      setScore(n);
      if (n >= 5) {
        playSuccess();
        earnStar(houseId);
      }
      window.setTimeout(() => {
        setRound(nextRound(items, item.id));
        setLock(false);
      }, 1400);
    } else {
      playWrong();
      setWrong(item.id);
      say(
        lang,
        `${PHRASES.again.ar}. ${prompt.ar(round.target.ar)}`,
        `${PHRASES.again.en}. ${prompt.en(round.target.en)}`,
      );
      window.setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden bg-sky", className)}
      data-testid={testId}
      onPointerDown={ask}
    >
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-grass" />
      <ActivityChrome title={title} />
      <SparkleLayer bursts={bursts} />
      {lock ? <WordFlash ar={round.target.ar} en={round.target.en} /> : null}
      <div className="absolute inset-x-0 bottom-[8%] top-[18%] flex items-end justify-center gap-2 px-3 sm:gap-6">
        {round.options.map((item) => (
          <button
            key={item.id}
            type="button"
            data-choice="1"
            data-testid={`choice-${item.id}`}
            aria-label={`${item.ar} / ${item.en}`}
            onPointerDown={(e) => pick(item, e)}
            className={cn(
              "flex h-[58%] max-h-72 w-[31%] max-w-48 items-end justify-center",
              wrong === item.id && "wiggle",
              lock && item.id === round.target.id && "bounce-in",
            )}
          >
            {item.glyph ? (
              <LetterTile glyph={item.glyph} tint={item.tint ?? "#4d96ff"} />
            ) : (
              <Sprite src={item.src!} className="h-full w-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LetterTile({ glyph, tint }: { glyph: string; tint: string }) {
  const arabic = /[\u0600-\u06FF]/.test(glyph);
  return (
    <span
      className="grid aspect-square w-full max-w-[9.5rem] place-items-center rounded-[1.8rem] shadow-[0_10px_0_rgb(62_47_47_/_0.18)]"
      style={{ background: tint }}
    >
      <span
        className={cn(
          "font-display leading-none text-cream",
          arabic ? "text-7xl sm:text-8xl" : "text-6xl sm:text-7xl",
        )}
      >
        {glyph}
      </span>
    </span>
  );
}
