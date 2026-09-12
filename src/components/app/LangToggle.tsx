import { playPop } from "@/lib/audio";
import type { SpeechLang } from "@/lib/speech";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const OPTS: { id: SpeechLang; ar: string; en: string }[] = [
  { id: "ar", ar: "عربي", en: "AR" },
  { id: "both", ar: "الاتنين", en: "Both" },
  { id: "en", ar: "English", en: "EN" },
];

export function LangToggle({
  className,
  size = "md",
  onPicked,
}: {
  className?: string;
  size?: "md" | "lg";
  onPicked?: (lang: SpeechLang) => void;
}) {
  const lang = useAppStore((s) => s.speechLang);
  const setSpeechLang = useAppStore((s) => s.setSpeechLang);

  return (
    <div
      className={cn("grid grid-cols-3 gap-1.5", className)}
      data-testid="lang-toggle"
    >
      {OPTS.map((o) => (
        <button
          key={o.id}
          type="button"
          data-testid={`lang-${o.id}`}
          aria-pressed={lang === o.id}
          onPointerDown={(e) => {
            e.stopPropagation();
            playPop();
            setSpeechLang(o.id);
            onPicked?.(o.id);
          }}
          className={cn(
            "rounded-2xl font-semibold shadow-[0_4px_0_#e4d8c8] transition-transform",
            size === "lg" ? "px-3 py-3 text-lg" : "px-2 py-2 text-sm",
            lang === o.id ? "bg-parent-accent text-cream" : "bg-cream text-ink",
          )}
        >
          <span className="block leading-tight">{o.ar}</span>
          {size === "lg" ? <span className="block text-xs opacity-80">{o.en}</span> : null}
        </button>
      ))}
    </div>
  );
}
