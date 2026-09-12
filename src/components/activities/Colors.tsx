import { ART } from "@/components/art/Sprite";
import { COLOR_NAMES, PHRASES } from "@/lib/speech";
import { FindLesson, type LessonItem } from "./FindLesson";

const ITEMS: LessonItem[] = ["red", "blue", "yellow", "green", "orange", "pink"].map((id) => ({
  id,
  src: ART.color(id),
  ar: COLOR_NAMES[id]!.ar,
  en: COLOR_NAMES[id]!.en,
}));

export function ColorsActivity() {
  return (
    <FindLesson
      houseId="colors"
      title="بيت الألوان"
      testId="activity-colors"
      className="bg-cream"
      items={ITEMS}
      prompt={PHRASES.whereColor}
    />
  );
}
