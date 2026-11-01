import type { ContentFile, Unit, Lesson, Word, Sentence, FillBlankQuestion } from '@/types/content';

const modules = import.meta.glob<{ default: ContentFile }>('./unit-*.json', { eager: true });
const files: ContentFile[] = Object.values(modules).map((m) => m.default as ContentFile);

type RawWord = [string, string, string] | Word;
type RawSentence = [string, string] | Sentence;

function normalizeWord(w: RawWord): Word {
  if (Array.isArray(w)) {
    return { en: w[0], ar: w[1], emoji: w[2] };
  }
  return w;
}

function normalizeSentence(s: RawSentence): Sentence {
  if (Array.isArray(s)) {
    return { en: s[0], ar: s[1] };
  }
  return s;
}

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
            words: l.words.map((w) => normalizeWord(w as RawWord)),
            sentences: l.sentences.map((s) => normalizeSentence(s as RawSentence)),
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
