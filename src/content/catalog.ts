import { loadContent } from '@/content/loader';
import type { Lesson, Unit, Word } from '@/types/content';

const { units, fillBlanks } = loadContent();

export const ALL_UNITS: Unit[] = units;
export const ALL_LESSONS: Lesson[] = units.flatMap((u, ui) =>
  u.lessons.map((l) => ({ ...l, unitIndex: ui }))
);
export const ALL_WORDS: Word[] = ALL_LESSONS.flatMap((l) => l.words);
export const FILL_BLANKS = fillBlanks;
export const SENTENCE_WORDS: string[] = [
  ...new Set(ALL_LESSONS.flatMap((l) => l.sentences.flatMap((s) => s.en.split(' ')))),
];

/** Paths: groups of unit indices shown on the home screen. */
export const PATH_NAMES = [
  'المبتدئ 🌱',
  'السفر والتسوق ✈️',
  'حياتك اليومية 🏡',
  'العمل والدراسة 💼',
  'المحادثة المتقدمة 🗣️',
];
export const PATH_UNITS: number[][] = [
  [0, 1, 2],
  [3],
  [4, 5],
  [6, 7],
  [8],
];

/** Path starting lesson index (cumulative lesson count at each path boundary). */
export const PATH_STARTS = [0, 9, 12, 32, 52];
/** Path completion counts (total lessons per path). */
export const PATH_COUNTS = [9, 3, 20, 20, 10];

export function pathOf(lessonIndex: number): number {
  let p = 0;
  while (PATH_STARTS[p + 1] != null && lessonIndex >= PATH_STARTS[p + 1]) p++;
  return p;
}

export function unitIndexOf(lessonIndex: number): number {
  return ALL_LESSONS[lessonIndex].unitIndex ?? 0;
}

export function unitStartLesson(unitIndex: number): number {
  return ALL_LESSONS.findIndex((l) => l.unitIndex === unitIndex);
}

export function unitEndLesson(unitIndex: number): number {
  return unitStartLesson(unitIndex) + ALL_UNITS[unitIndex].lessons.length;
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/** Find a sentence containing a word for study cards. */
export function findSentenceForWord(lesson: Lesson, word: Word): [string, string] | null {
  const wl = word.en.toLowerCase().replace(/s$/, '');
  const found = lesson.sentences.find((s) =>
    s.en.toLowerCase().split(' ').some((x) => x.replace(/s$/, '') === wl)
  );
  return found ? [found.en, found.ar] : null;
}
