import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setMasterVolume, unlockAudio } from "./audio";
import type { SpeechLang } from "./speech";

export type ActivityId =
  | "hub"
  | "animals"
  | "colors"
  | "shapes"
  | "numbers"
  | "letters"
  | "body"
  | "fruits"
  | "habits"
  | "music";
export type HouseId = Exclude<ActivityId, "hub">;

type AppState = {
  started: boolean;
  activity: ActivityId;
  speechLang: SpeechLang;
  muted: boolean;
  volume: number;
  stars: Record<HouseId, boolean>;
  start: () => void;
  go: (id: ActivityId) => void;
  setSpeechLang: (lang: SpeechLang) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (v: number) => void;
  earnStar: (id: HouseId) => void;
  resetStars: () => void;
};

const emptyStars: Record<HouseId, boolean> = {
  animals: false,
  colors: false,
  shapes: false,
  numbers: false,
  letters: false,
  body: false,
  fruits: false,
  habits: false,
  music: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      started: false,
      activity: "hub",
      speechLang: "both",
      muted: false,
      volume: 0.85,
      stars: { ...emptyStars },
      start: () => {
        unlockAudio();
        setMasterVolume(get().volume, get().muted);
        set({ started: true, activity: "hub" });
      },
      go: (id) => set({ activity: id }),
      setSpeechLang: (speechLang) => set({ speechLang }),
      setMuted: (muted) => {
        set({ muted });
        setMasterVolume(get().volume, muted);
      },
      setVolume: (volume) => {
        set({ volume });
        setMasterVolume(volume, get().muted);
      },
      earnStar: (id) =>
        set((s) => ({
          stars: { ...s.stars, [id]: true },
        })),
      resetStars: () => set({ stars: { ...emptyStars } }),
    }),
    {
      name: "little-explorer-world",
      skipHydration: true,
      partialize: (s) => ({
        speechLang: s.speechLang,
        muted: s.muted,
        volume: s.volume,
        stars: s.stars,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        const lang = p.speechLang === "ar" || p.speechLang === "en" || p.speechLang === "both" ? p.speechLang : current.speechLang;
        return {
          ...current,
          ...p,
          speechLang: lang,
          stars: { ...emptyStars, ...p.stars },
        };
      },
    },
  ),
);

export const HOUSES: { id: HouseId; labelAr: string; labelEn: string }[] = [
  { id: "animals", labelAr: "حيوانات", labelEn: "Animals" },
  { id: "colors", labelAr: "ألوان", labelEn: "Colors" },
  { id: "shapes", labelAr: "أشكال", labelEn: "Shapes" },
  { id: "numbers", labelAr: "أرقام", labelEn: "Numbers" },
  { id: "letters", labelAr: "حروف", labelEn: "Letters" },
  { id: "body", labelAr: "جسمي", labelEn: "Body" },
  { id: "fruits", labelAr: "فاكهة", labelEn: "Fruit" },
  { id: "habits", labelAr: "روتين", labelEn: "Routine" },
  { id: "music", labelAr: "أصوات", labelEn: "Sounds" },
];
