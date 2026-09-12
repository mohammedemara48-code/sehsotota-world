import { LETTER_AR, LETTER_EN, PHRASES, type SpeechLang } from "@/lib/speech";
import { useAppStore } from "@/lib/store";
import { FindLesson, type LessonItem } from "./FindLesson";

function pack(kind: "ar" | "en", rows: typeof LETTER_AR): LessonItem[] {
  return rows.map((l) => ({
    id: `${kind}-${l.glyph}`,
    glyph: l.glyph,
    tint: l.tint,
    ar: l.ar,
    en: l.en,
  }));
}

function itemsFor(lang: SpeechLang): LessonItem[] {
  const ar = pack("ar", LETTER_AR);
  const en = pack("en", LETTER_EN);
  if (lang === "en") return en;
  if (lang === "ar") return ar;
  return [...ar, ...en];
}

export function LettersActivity() {
  const lang = useAppStore((s) => s.speechLang);
  const items = itemsFor(lang);
  return (
    <FindLesson
      key={lang}
      houseId="letters"
      title="بيت الحروف"
      testId="activity-letters"
      className="bg-cream"
      items={items}
      prompt={PHRASES.whereLetter}
    />
  );
}
