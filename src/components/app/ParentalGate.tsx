import { useEffect, useRef, useState, type PointerEvent } from "react";
import { playPop, playSuccess, playWrong } from "@/lib/audio";
import type { SpeechLang } from "@/lib/speech";
import { useAppStore } from "@/lib/store";
import { AndroidInstall } from "./AndroidInstall";

type Phase = "idle" | "holding" | "math" | "open";

function newProblem() {
  const a = 1 + Math.floor(Math.random() * 5);
  const b = 1 + Math.floor(Math.random() * 5);
  const sum = a + b;
  const opts = new Set<number>([sum]);
  while (opts.size < 3) {
    opts.add(Math.max(1, sum + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 3))));
  }
  return { a, b, sum, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function ParentalGate() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [shake, setShake] = useState(false);
  const [problem, setProblem] = useState(newProblem);
  const holdRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const problemRef = useRef(problem);
  problemRef.current = problem;

  const volume = useAppStore((s) => s.volume);
  const muted = useAppStore((s) => s.muted);
  const speechLang = useAppStore((s) => s.speechLang);
  const setVolume = useAppStore((s) => s.setVolume);
  const setMuted = useAppStore((s) => s.setMuted);
  const setSpeechLang = useAppStore((s) => s.setSpeechLang);
  const resetStars = useAppStore((s) => s.resetStars);

  const clearHold = () => {
    if (holdRef.current) window.clearInterval(holdRef.current);
    holdRef.current = null;
    setProgress(0);
    if (phaseRef.current === "holding") setPhase("idle");
  };

  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (phase === "open" || phase === "math") return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer may already have been released */
    }
    if (holdRef.current) window.clearInterval(holdRef.current);
    setPhase("holding");
    startRef.current = performance.now();
    let opened = false;
    holdRef.current = window.setInterval(() => {
      if (opened) return;
      const p = Math.min(1, (performance.now() - startRef.current) / 3000);
      setProgress(p);
      if (p >= 1) {
        opened = true;
        const id = holdRef.current;
        holdRef.current = null;
        if (id) window.clearInterval(id);
        const next = newProblem();
        problemRef.current = next;
        setProblem(next);
        setPhase("math");
        playPop();
      }
    }, 50);
  };

  useEffect(
    () => () => {
      if (holdRef.current) window.clearInterval(holdRef.current);
    },
    [],
  );

  const answer = (n: number) => {
    if (phaseRef.current !== "math") return;
    if (n === problemRef.current.sum) {
      setPhase("open");
      playSuccess();
    } else {
      playWrong();
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
    }
  };

  return (
    <>
      <button
        type="button"
        data-testid="parental-trigger"
        aria-label="إعدادات الوالدين"
        onPointerDown={onDown}
        onPointerUp={clearHold}
        onPointerCancel={clearHold}
        className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-50 grid size-12 place-items-center rounded-full bg-cream/70"
      >
        <svg viewBox="0 0 48 48" className="size-9">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#e4d8c8" strokeWidth="4" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#3f6f8a"
            strokeWidth="4"
            strokeDasharray={Math.PI * 2 * 20}
            strokeDashoffset={Math.PI * 2 * 20 * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 24 24)"
            className="gate-progress"
          />
          <circle cx="24" cy="24" r="6" fill="#3f6f8a" opacity={0.55} />
        </svg>
      </button>

      {phase === "math" || phase === "open" ? (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          dir="rtl"
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`max-h-[min(40rem,90dvh)] w-full max-w-sm overflow-y-auto rounded-[28px] bg-parent-bg p-6 text-parent-fg shadow-[0_16px_0_#e4d8c8] ${shake ? "wiggle" : ""}`}
          >
            {phase === "math" ? (
              <div className="flex flex-col items-center gap-5">
                <p className="text-parent-muted text-sm font-medium">للوالدين</p>
                <p className="text-4xl font-semibold tracking-tight" data-testid="parent-math">
                  {problem.a} + {problem.b} = ؟
                </p>
                <div className="flex gap-3">
                  {problem.options.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => answer(n)}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        answer(n);
                      }}
                      className="pressable size-16 rounded-2xl bg-cream text-2xl font-semibold text-parent-fg shadow-[0_4px_0_#e4d8c8]"
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button type="button" className="text-parent-muted text-sm" onPointerDown={() => setPhase("idle")}>
                  إغلاق
                </button>
              </div>
            ) : (
              <Settings
                volume={volume}
                muted={muted}
                speechLang={speechLang}
                onVolume={setVolume}
                onMuted={setMuted}
                onLang={setSpeechLang}
                onReset={() => {
                  resetStars();
                  playPop();
                }}
                onClose={() => setPhase("idle")}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Settings({
  volume,
  muted,
  speechLang,
  onVolume,
  onMuted,
  onLang,
  onReset,
  onClose,
}: {
  volume: number;
  muted: boolean;
  speechLang: SpeechLang;
  onVolume: (v: number) => void;
  onMuted: (m: boolean) => void;
  onLang: (l: SpeechLang) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">إعدادات الوالدين</h2>
        <button type="button" onPointerDown={onClose} className="text-parent-muted text-sm" aria-label="إغلاق">
          إغلاق
        </button>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-parent-muted">الصوت</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => onVolume(Number(e.target.value))}
          className="accent-parent-accent w-full"
        />
      </label>
      <button
        type="button"
        onPointerDown={() => onMuted(!muted)}
        className="rounded-2xl bg-cream px-4 py-3 text-right font-medium shadow-[0_3px_0_#e4d8c8]"
      >
        {muted ? "تشغيل الصوت" : "كتم الصوت"}
      </button>
      <div className="flex flex-col gap-2">
        <span className="text-parent-muted text-sm">لغة التعلّم / Language</span>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["ar", "عربي"],
              ["both", "الاتنين"],
              ["en", "English"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onPointerDown={() => onLang(id)}
              className={`rounded-2xl px-2 py-3 text-sm font-medium ${speechLang === id ? "bg-parent-accent text-cream" : "bg-cream text-parent-fg"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <AndroidInstall />
      <button type="button" onPointerDown={onReset} className="text-parent-muted rounded-2xl bg-cream px-4 py-3 text-right">
        إعادة تعيين النجوم
      </button>
      <p className="text-parent-muted text-xs leading-relaxed">
        لا إعلانات ولا مشتريات. اضغط مطولاً ثلاث ثوانٍ على النقطة أعلى اليمين للعودة إلى الإعدادات.
      </p>
    </div>
  );
}
