import { ART } from "@/components/art/Sprite";
import { playAnimal, type AnimalKind } from "@/lib/audio";
import { ANIMAL_NAMES, PHRASES } from "@/lib/speech";
import { FindLesson, type LessonItem } from "./FindLesson";

const ITEMS: LessonItem[] = (["cat", "dog", "cow", "bird", "frog", "elephant"] as AnimalKind[]).map((id) => ({
  id,
  src: ART.animal(id),
  ar: ANIMAL_NAMES[id]!.ar,
  en: ANIMAL_NAMES[id]!.en,
}));

export function AnimalsActivity() {
  return (
    <FindLesson
      houseId="animals"
      title="بيت الحيوانات"
      testId="activity-animals"
      items={ITEMS}
      prompt={PHRASES.where}
      onCorrect={(id) => playAnimal(id as AnimalKind)}
    />
  );
}
