import { ART } from "@/components/art/Sprite";
import { playPop, unlockAudio } from "@/lib/audio";
import type { SpeechLang } from "@/lib/speech";
import { useAppStore } from "@/lib/store";
import { LangToggle } from "./LangToggle";
import { Hills, SkyDecor } from "./Sky";

export function StartGate() {
  const start = useAppStore((s) => s.start);
  const setSpeechLang = useAppStore((s) => s.setSpeechLang);

  const enter = (lang?: SpeechLang) => {
    unlockAudio();
    playPop();
    if (lang) setSpeechLang(lang);
    start();
  };

  return (
    <div className="absolute inset-0" data-testid="start-gate">
      <SkyDecor />
      <Hills />
      <div className="absolute inset-x-0 top-[8%] z-10 px-5">
        <p className="mb-3 text-center text-xl font-semibold text-ink drop-shadow-sm">عربي · English</p>
        <LangToggle size="lg" onPicked={() => enter()} />
      </div>
      <button
        type="button"
        aria-label="ابدأ اللعب / Start playing"
        onPointerDown={() => enter()}
        className="absolute inset-x-0 bottom-[2%] z-10 flex flex-col items-center"
      >
        <div className="relative">
          <div className="ring-pulse absolute inset-[-8%] rounded-full border-4 border-sun" />
          <div
            className="ring-pulse absolute inset-[-16%] rounded-full border-4 border-sun/50"
            style={{ animationDelay: "0.5s" }}
          />
          <img src={ART.bear} alt="" draggable={false} className="bob relative h-[38vh] max-h-72 w-auto select-none" />
        </div>
        <span className="sr-only">عالم المستكشف الصغير. اضغط للدخول.</span>
      </button>
    </div>
  );
}
