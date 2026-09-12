export type SpeechLang = "ar" | "en" | "both";

export const ANIMAL_NAMES: Record<string, { ar: string; en: string }> = {
  cat: { ar: "قطة", en: "cat" },
  dog: { ar: "كلب", en: "dog" },
  cow: { ar: "بقرة", en: "cow" },
  bird: { ar: "عصفور", en: "bird" },
  frog: { ar: "ضفدع", en: "frog" },
  elephant: { ar: "فيل", en: "elephant" },
};

export const COLOR_NAMES: Record<string, { ar: string; en: string }> = {
  red: { ar: "أحمر", en: "red" },
  blue: { ar: "أزرق", en: "blue" },
  yellow: { ar: "أصفر", en: "yellow" },
  green: { ar: "أخضر", en: "green" },
  orange: { ar: "برتقالي", en: "orange" },
  pink: { ar: "بمبي", en: "pink" },
};

export const SHAPE_NAMES: Record<string, { ar: string; en: string }> = {
  circle: { ar: "دايرة", en: "circle" },
  square: { ar: "مربع", en: "square" },
  triangle: { ar: "مثلث", en: "triangle" },
  star: { ar: "نجمة", en: "star" },
};

export const FRUIT_NAMES: Record<string, { ar: string; en: string }> = {
  apple: { ar: "تفاحة", en: "apple" },
  banana: { ar: "موزة", en: "banana" },
  orange: { ar: "برتقالة", en: "orange" },
  strawberry: { ar: "فراولة", en: "strawberry" },
  grapes: { ar: "عنب", en: "grapes" },
  watermelon: { ar: "بطيخة", en: "watermelon" },
};

export const BODY_NAMES: Record<string, { ar: string; en: string }> = {
  head: { ar: "راس", en: "head" },
  hand: { ar: "إيد", en: "hand" },
  belly: { ar: "بطن", en: "belly" },
  foot: { ar: "رجل", en: "foot" },
};

export const NUMBER_NAMES: Record<number, { ar: string; en: string }> = {
  1: { ar: "واحد", en: "one" },
  2: { ar: "اتنين", en: "two" },
  3: { ar: "تلاتة", en: "three" },
  4: { ar: "أربعة", en: "four" },
  5: { ar: "خمسة", en: "five" },
};

export const INDIC = ["٠", "١", "٢", "٣", "٤", "٥"] as const;

export const LETTER_AR: { glyph: string; ar: string; en: string; tint: string }[] = [
  { glyph: "ا", ar: "ألف", en: "alif", tint: "#ff6b6b" },
  { glyph: "ب", ar: "باء", en: "baa", tint: "#4d96ff" },
  { glyph: "ت", ar: "تاء", en: "taa", tint: "#ffd166" },
  { glyph: "ج", ar: "جيم", en: "jeem", tint: "#7ed957" },
  { glyph: "م", ar: "ميم", en: "meem", tint: "#ff9f43" },
  { glyph: "س", ar: "سين", en: "seen", tint: "#7b6dff" },
];

export const LETTER_EN: { glyph: string; ar: string; en: string; tint: string }[] = [
  { glyph: "A", ar: "إي", en: "A", tint: "#ff6b6b" },
  { glyph: "B", ar: "بي", en: "B", tint: "#4d96ff" },
  { glyph: "C", ar: "سي", en: "C", tint: "#ffd166" },
  { glyph: "D", ar: "دي", en: "D", tint: "#7ed957" },
  { glyph: "O", ar: "أو", en: "O", tint: "#ff9f43" },
  { glyph: "S", ar: "إس", en: "S", tint: "#7b6dff" },
];

export const PHRASES = {
  where: { ar: (n: string) => `فين ال${n}؟`, en: (n: string) => `Where is the ${n}?` },
  whereColor: { ar: (n: string) => `فين اللون ال${n}؟`, en: (n: string) => `Where is ${n}?` },
  whereLetter: { ar: (n: string) => `فين حرف ${n}؟`, en: (n: string) => `Where is the letter ${n}?` },
  putShape: { ar: (n: string) => `حط ال${n} في مكانه`, en: (n: string) => `Put the ${n} in its hole` },
  howMany: { ar: "كام واحدة؟", en: "How many?" },
  high: { ar: "الصوت العالي", en: "the high sound" },
  low: { ar: "الصوت الواطي", en: "the low sound" },
  brush: { ar: "يلا نغسل سناننا", en: "Let's brush our teeth" },
  eat: { ar: "يلا ناكل التفاحة", en: "Let's eat the apple" },
  sleep: { ar: "يلا ننام", en: "Let's go to sleep" },
  bravo: { ar: "برافو شاطر", en: "Well done" },
  again: { ar: "لأ، حاول تاني", en: "Try again" },
};

function makeUtterance(text: string, lang: "ar" | "en") {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "ar" ? "ar-EG" : "en-US";
  u.pitch = 1.35;
  u.rate = 0.82;
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang === "ar" ? "ar" : "en";
  const match =
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix) && v.lang.toLowerCase().includes("eg")) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  if (match) u.voice = match;
  return u;
}

export function speakText(text: string, lang: "ar" | "en") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(makeUtterance(text, lang));
}

export function say(mode: SpeechLang, ar: string, en: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  if (mode === "ar") {
    window.speechSynthesis.speak(makeUtterance(ar, "ar"));
    return;
  }
  if (mode === "en") {
    window.speechSynthesis.speak(makeUtterance(en, "en"));
    return;
  }
  const first = makeUtterance(ar, "ar");
  first.onend = () => {
    window.speechSynthesis.speak(makeUtterance(en, "en"));
  };
  window.speechSynthesis.speak(first);
}

export function speakName(kind: string, lang: SpeechLang) {
  const names = ANIMAL_NAMES[kind];
  if (!names) return;
  say(lang, names.ar, names.en);
}

export function speakNumber(n: number, lang: SpeechLang) {
  const names = NUMBER_NAMES[n];
  if (!names) return;
  say(lang, names.ar, names.en);
}

export function pick(pair: { ar: string; en: string }, lang: Exclude<SpeechLang, "both">) {
  return pair[lang];
}
