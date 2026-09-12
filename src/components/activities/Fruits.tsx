import { ART } from "@/components/art/Sprite";
import { FRUIT_NAMES, PHRASES } from "@/lib/speech";
import { FindLesson, type LessonItem } from "./FindLesson";

const ITEMS: LessonItem[] = ["apple", "banana", "orange", "strawberry", "grapes", "watermelon"].map((id) => ({
  id,
  src: ART.fruit(id),
  ar: FRUIT_NAMES[id]!.ar,
  en: FRUIT_NAMES[id]!.en,
}));

export function FruitsActivity() {
  return (
    <FindLesson
      houseId="fruits"
      title="بيت الفاكهة"
      testId="activity-fruits"
      items={ITEMS}
      prompt={PHRASES.where}
    />
  );
}
