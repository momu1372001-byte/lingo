export interface Word {
  /** English word */
  en: string;
  /** Arabic translation */
  ar: string;
  /** Emoji representation */
  emoji: string;
}

export interface Sentence {
  /** English sentence */
  en: string;
  /** Arabic translation */
  ar: string;
}

export interface Lesson {
  /** Lesson name (Arabic) */
  name: string;
  /** Emoji icon */
  emoji: string;
  /** Vocabulary words */
  words: Word[];
  /** Example sentences */
  sentences: Sentence[];
  /** Grammar notes shown when learner taps to reveal */
  grammarNotes?: string[];
  /** Unit index (added at runtime by the catalog) */
  unitIndex?: number;
}

export interface Unit {
  /** Unit title (Arabic) */
  title: string;
  /** Unit color */
  color: string;
  /** Lessons in this unit */
  lessons: Lesson[];
}

export interface FillBlankQuestion {
  /** Sentence template with "___" placeholder */
  template: string;
  /** Correct answer */
  answer: string;
  /** Distractors */
  distractors: string[];
  /** Arabic translation */
  ar: string;
}

export interface ContentFile {
  units: Unit[];
  /** Fill-in-the-blank questions */
  fillBlanks?: FillBlankQuestion[];
}

export type QuestionType =
  | 'mc'
  | 'pic'
  | 'mc2'
  | 'ls'
  | 'wr'
  | 'mt'
  | 'fi'
  | 'lf'
  | 'bk'
  | 'sp'
  | 'tf'
  | 'sc'
  | 'ts'
  | 'lt';

export type LessonMode = 'lesson' | 'practice' | 'test';

export type LessonRank = 0 | 1 | 2;

export interface ProgressState {
  xp: number;
  gems: number;
  hearts: number;
  streak: number;
  last: string;
  /** Per-path progress */
  pg: number[];
  /** Current path index */
  path: number;
  /** Daily XP */
  dxp: number;
  /** Daily lessons completed */
  ls: number;
  /** Daily perfect lessons */
  pf: number;
  /** Date string */
  dd: string;
  /** Claimed quest rewards */
  cl: number[];
  /** Streak freezes owned */
  fr: number;
  /** Double XP boost active */
  bx: number;
  /** Avatar emoji */
  av: string;
  /** Total lessons completed */
  tot: number;
  /** Total perfect lessons */
  pfa: number;
  /** Weekly XP (leaderboard) */
  wk: number;
  /** Heart regen timestamp */
  ht: number;
  /** Lock timestamp for practice hearts */
  lock: number;
  /** Unit tests passed (by unit index) */
  ut: Record<number, boolean>;
  /** Mistaken words */
  mw: string[];
  settings: Settings;
}

export interface Settings {
  /** Sound & speech */
  snd: 0 | 1;
  /** Sound effects */
  fx: 0 | 1;
  /** Slow speech */
  slow: 0 | 1;
  /** Daily goal */
  goal: number;
  /** Theme */
  th: 'auto' | 'light' | 'dark';
  /** Translation language */
  lang: string;
}

export type TabKey = 'h' | 'v' | 'q' | 'r' | 's' | 'm';
