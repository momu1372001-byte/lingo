import type { ContentFile, Unit, Lesson, Word, Sentence } from '@/types/content';
import type { FillBlankQuestion } from '@/types/content';

import basics from '@/content/unit-basics.json';
import travel from '@/content/unit-travel.json';
import daily from '@/content/unit-daily.json';
import work from '@/content/unit-work.json';
import advanced from '@/content/unit-advanced.json';

import type { Word as W, Sentence as S, Lesson as L, Unit as U, FillBlankQuestion as FB } from '@/types/content';

const files: ContentFile[] = [
  basics as unknown as ContentFile,
  travel as unknown as ContentFile,
  daily as unknown as ContentFile,
  work as unknown as ContentFile,
  advanced as unknown as ContentFile,
];

export function loadContent() {
  const units: Unit[] = [];
  const fillBlanks: FillBlankQuestion[] = [];

  files.forEach((file) => {
    if (file.units) {
      units.push(
        ...file.units.map((u) => ({
          title: u.title,
          color: u.color,
          lessons: u.lessons.map((l) => ({
            name: l.name,
            emoji: l.emoji,
            words: l.words.map((w) => w as Word),
            sentences: l.sentences.map((s) => s as Sentence),
            grammarNotes: (l as unknown as { grammarNotes?: string[] }).grammarNotes,
          })) as Lesson[],
        })) as Unit[],
      );
    }
    if (file.fillBlanks) {
      fillBlanks.push(...(file.fillBlanks as FillBlankQuestion[]));
    }
  });

  return { units, fillBlanks };
}

export { type U, type L, type W, type S, type FB };
