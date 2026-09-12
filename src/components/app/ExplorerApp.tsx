import { useEffect, type ReactNode } from "react";
import { AnimalsActivity } from "@/components/activities/Animals";
import { BodyActivity } from "@/components/activities/Body";
import { ColorsActivity } from "@/components/activities/Colors";
import { FruitsActivity } from "@/components/activities/Fruits";
import { HabitsActivity } from "@/components/activities/Habits";
import { LettersActivity } from "@/components/activities/Letters";
import { MusicActivity } from "@/components/activities/Music";
import { NumbersActivity } from "@/components/activities/Numbers";
import { ShapesActivity } from "@/components/activities/Shapes";
import { setMasterVolume, unlockAudio } from "@/lib/audio";
import { captureInstallPrompt, registerServiceWorker } from "@/lib/pwa";
import { useAppStore, type HouseId } from "@/lib/store";
import { ParentalGate } from "./ParentalGate";
import { StartGate } from "./StartGate";
import { VillageHub } from "./VillageHub";

const PLAY: Record<HouseId, () => ReactNode> = {
  animals: () => <AnimalsActivity />,
  colors: () => <ColorsActivity />,
  shapes: () => <ShapesActivity />,
  numbers: () => <NumbersActivity />,
  letters: () => <LettersActivity />,
  body: () => <BodyActivity />,
  fruits: () => <FruitsActivity />,
  habits: () => <HabitsActivity />,
  music: () => <MusicActivity />,
};

export function ExplorerApp() {
  const started = useAppStore((s) => s.started);
  const activity = useAppStore((s) => s.activity);
  const volume = useAppStore((s) => s.volume);
  const muted = useAppStore((s) => s.muted);

  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    setMasterVolume(volume, muted);
  }, [volume, muted]);

  useEffect(() => {
    captureInstallPrompt();
    registerServiceWorker();
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("gesturestart", prevent);
    const warm = () => unlockAudio();
    window.addEventListener("pointerdown", warm, { once: true });
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("gesturestart", prevent);
      window.removeEventListener("pointerdown", warm);
    };
  }, []);

  const Play = activity !== "hub" ? PLAY[activity] : null;

  return (
    <main className="explorer-root" data-testid="explorer-root">
      {!started ? <StartGate /> : null}
      {started && activity === "hub" ? <VillageHub /> : null}
      {started && Play ? Play() : null}
      {started ? <ParentalGate /> : null}
    </main>
  );
}
