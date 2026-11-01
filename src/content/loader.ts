import type { ContentFile, Unit, Lesson, Word, Sentence, FillBlankQuestion } from '@/types/content';

const modules = import.meta.glob<{ default: ContentFile }>('./unit-*.json', { eager: true });
const files: ContentFile[] = Object.values(modules).map((m) => m.default as ContentFile);

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
            grammarNotes: l.grammarNotes,
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
