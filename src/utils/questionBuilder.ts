import type { Word, Sentence, QuestionType } from '@/types/content';
import { shuffle } from '@/utils/shuffle';
import { ALL_LESSONS } from '@/content/catalog';

const ALL_LESSONS_SENTENCES_AR = ALL_LESSONS.flatMap((l) => l.sentences.map((s) => s.ar));

export interface QuestionOption {
  t: string;
  ok?: boolean;
  e?: string;
}

export interface Question {
  y: QuestionType;
  c?: Word;
  o?: QuestionOption[];
  a?: string;
  ar?: string;
  t?: string;
  full?: string;
  p?: Word[];
  s?: Sentence;
  template?: string;
  answer?: string;
  distractors?: string[];
  m?: Word;
}

export function buildOptions(
  correct: Word,
  lessonWords: Word[],
  pool: Word[],
  field: 'ar' | 'emoji' | 'en',
): QuestionOption[] {
  const all = [...lessonWords, ...pool.slice(0, 3)];
  const distractors = shuffle(all.filter((x) => x !== correct)).slice(0, 3);
  return shuffle([correct, ...distractors]).map((x) => ({
    t: x[field],
    ok: x === correct,
    e: x.emoji,
  }));
}

export function buildFillOptions(
  answer: string,
  distractors: string[],
  sentenceWords: string[],
): QuestionOption[] {
  const pool =
    distractors.length > 0
      ? distractors
      : shuffle([...new Set(sentenceWords)].filter((x) => x.toLowerCase() !== answer.toLowerCase())).slice(0, 3);
  return shuffle([answer, ...pool]).map((t) => ({ t, ok: t === answer }));
}

export function blankOutSentence(s: Sentence): { template: string; answer: string; ar: string; full: string } {
  const ws = s.en.split(' ');
  const candidates = ws.map((_, j) => j).filter((j) => ws[j].length > 2);
  const k = candidates[Math.floor(Math.random() * candidates.length)];
  const answer = ws[k];
  ws[k] = '___';
  return { template: ws.join(' '), answer, ar: s.ar, full: s.en };
}

export function buildQuestions(
  lessonWords: Word[],
  lessonSentences: Sentence[],
  pool: Word[],
  sentenceWords: string[],
  fillBlanks: { template: string; answer: string; distractors: string[]; ar: string }[],
  lessonIndex: number,
): Question[] {
  const w = shuffle(lessonWords);
  const opts = (c: Word, field: 'ar' | 'emoji' | 'en') =>
    buildOptions(c, lessonWords, pool, field);

  const fo = (a: string, d?: string[]) =>
    buildFillOptions(a, d || [], sentenceWords);

  const ss = shuffle(lessonSentences);

  const qs: Question[] = [
    ...w.slice(0, 2).map((c) => ({ y: 'mc' as QuestionType, c, o: opts(c, 'ar') })),
    ...w.slice(2, 4).map((c) => ({ y: 'pic' as QuestionType, c, o: opts(c, 'emoji') })),
    { y: 'mc2' as QuestionType, c: w[4], o: opts(w[4], 'en') },
    { y: 'ls' as QuestionType, c: w[0], o: opts(w[0], 'en') },
    ...[w[1], w[3]].map((c) => ({ y: 'wr' as QuestionType, c, a: c.en })),
    { y: 'mt' as QuestionType, p: w.slice(0, 5) },
    ...fillBlanks.slice(lessonIndex * 2, lessonIndex * 2 + 2).map((x) => ({
      y: 'fi' as QuestionType,
      template: x.template,
      answer: x.answer,
      distractors: x.distractors,
      ar: x.ar,
      o: fo(x.answer, x.distractors),
    })),
  ];

  if (ss.length > 0) {
    const b1 = blankOutSentence(ss[0]);
    qs.push({
      y: 'fi',
      template: b1.template,
      answer: b1.answer,
      ar: b1.ar,
      full: b1.full,
      o: fo(b1.answer),
    });
  }

  if (ss.length > 1) {
    const b2 = blankOutSentence(ss[1]);
    const useListen = Math.random() < 0.5;
    qs.push({
      y: useListen ? 'lf' : 'fi',
      template: b2.template,
      answer: b2.answer,
      ar: b2.ar,
      full: b2.full,
      o: useListen ? fo(b2.answer) : undefined,
    });
  }

  if (ss.length > 0) qs.push({ y: 'bk', s: ss[0] });
  if (ss.length > 1) qs.push({ y: 'sp', a: ss[1].en, ar: ss[1].ar });

  if (w[2]) {
    const tf = Math.random() < 0.5;
    const m = tf ? w[2] : shuffle(pool.filter((x) => x !== w[2]))[0] || w[2];
    qs.push({
      y: 'tf',
      c: w[2],
      m,
      o: [
        { t: 'صح ✅', ok: tf },
        { t: 'خطأ ❌', ok: !tf },
      ],
    });
  }

  if (w[0]) {
    qs.push({ y: 'sc', c: w[0], a: w[0].en.toLowerCase() });
  }

  if (ss.length > 1) {
    qs.push({ y: 'ts', a: ss[1].en, ar: ss[1].ar });
  }

  if (ss.length > 0) {
    const tr = shuffle([
      ss[0].ar,
      ...shuffle(
        sentenceWords.length > 0
          ? ALL_LESSONS_SENTENCES_AR.filter((s) => s !== ss[0].ar).slice(0, 2)
          : [],
      ),
    ]).map((t) => ({ t, ok: t === ss[0].ar }));
    qs.push({ y: 'lt', full: ss[0].en, ar: ss[0].ar, o: tr });
  }

  const nonSp = qs.filter((x) => x.y !== 'sp');
  const sp = qs.filter((x) => x.y === 'sp');
  return [...shuffle(nonSp).slice(0, 16), ...sp];
}

// helper to get all Arabic sentences for the listen-translate question
import { ALL_LESSONS } from '@/content/catalog';
const ALL_LESSONS_SENTENCES_AR = ALL_LESSONS.flatMap((l) => l.sentences.map((s) => s.ar));
