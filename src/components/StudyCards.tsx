import { useState } from 'react';
import { ALL_UNITS, ALL_LESSONS, unitStartLesson, findSentenceForWord, unitIndexOf } from '@/content/catalog';
import type { Lesson, Word } from '@/types/content';
import { speak } from '@/utils/speech';

interface StudyCardsProps {
  onBack: () => void;
  onPractice: (lessonIndex: number) => void;
}

const LANGS: Record<string, string> = {
  ar: 'العربية',
  fr: 'Français',
  hi: 'हिन्दी',
  es: 'Español',
};

const GRAMMAR_NOTES = [
  'a / an: نستخدم a قبل الصوت الساكن (a cat) و an قبل الصوت المتحرك (an apple). فعل الكينونة: I am – You are – He/She/It is.',
  'الصفة تأتي قبل الاسم: a red car (وليس a car red). وبعد الأرقام الأكبر من واحد يأخذ الاسم s: two cats.',
  'مع He / She / It نضيف s للفعل في المضارع: I read – she reads. والنفي يكون بـ do not / does not.',
  'للسؤال استخدم Where is...? / How much is...? وللطلب المهذب: I need... / Can I have...?',
  'للحالة والمشاعر نستخدم am/is/are + صفة: I am happy, she is tired. وللإشارة: This is... / These are...',
  'الصفة لا تتغير مع الجمع: a big house – big houses. ونضع very قبل الصفة للتأكيد: very big.',
  'للطلب المهذب في العمل: Could you ... please? وللتعبير بأدب عن رغبتك: I would like ...',
  'المضارع البسيط للحقائق والعادات: Water boils at 100 degrees. والماضي البسيط للأحداث المنتهية: I studied yesterday.',
  'أسئلة Yes/No تبدأ بـ Do / Does / Is / Are / Can: Are you free today? والأمر بدون فاعل: Please wait here.',
];

export default function StudyCards({ onBack, onPractice }: StudyCardsProps) {
  const [deckIndex, setDeckIndex] = useState<number | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  if (deckIndex === null) {
    return (
      <>
        <div className="lh">
          <button className="x" onClick={onBack}>
            →
          </button>
          <b style={{ fontSize: 20 }}>📖 بطاقات التعلّم</b>
        </div>
        <div className="pg" style={{ paddingTop: 0 }}>
          <p style={{ color: 'var(--mut)' }}>
            ادرس الكلمات والجمل قبل الممارسة، بالسرعة التي تناسبك.
          </p>
          {ALL_UNITS.map((u, ui) => (
            <div key={ui}>
              <div className="unit" style={{ background: u.color }}>
                {u.title}
              </div>
              {u.lessons.map((l, li) => {
                const lessonIndex = unitStartLesson(ui) + li;
                return (
                  <div
                    className="card"
                    key={li}
                    onClick={() => {
                      setDeckIndex(lessonIndex);
                      setCardIndex(0);
                      setFlipped(false);
                      setRevealed({});
                    }}
                  >
                    <span style={{ fontSize: 30 }}>{l.emoji}</span>
                    <b style={{ flex: 1 }}>{l.name}</b>
                    <small>{l.words.length} كلمات</small>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </>
    );
  }

  const lesson: Lesson = ALL_LESSONS[deckIndex];
  const word: Word = lesson.words[cardIndex];
  const n = lesson.words.length;
  const sentence = findSentenceForWord(lesson, word);
  const grammarNote = (lesson as Lesson).grammarNotes?.[0] || GRAMMAR_NOTES[unitIndexOf(deckIndex) % GRAMMAR_NOTES.length];
  const lang = 'ar';

  const next = (dir: number) => {
    const ni = cardIndex + dir;
    if (ni >= n) {
      onPractice(deckIndex);
      return;
    }
    if (ni < 0) return;
    setCardIndex(ni);
    setFlipped(false);
    setRevealed({});
  };

  const toggleReveal = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="lh">
        <button
          className="x"
          onClick={() => {
            setDeckIndex(null);
          }}
        >
          ✕
        </button>
        <div className="pb">
          <i style={{ width: `${((cardIndex + 1) / n) * 100}%` }} />
        </div>
        <b>
          {cardIndex + 1}/{n}
        </b>
      </div>
      <div className="pg" style={{ paddingTop: 0 }}>
        <div className="scene">
          <div
            className={`cardx${flipped ? ' flp' : ''}`}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className="face front">
              <div className="cimg">{word.emoji}</div>
              <div className="crow">
                <span className="cw">{word.en}</span>
                <button
                  className="ib"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(word.en, { enabled: true });
                  }}
                >
                  🔊
                </button>
              </div>
              {sentence && (
                <>
                  <div className="crow sn">
                    <span>{sentence[0]}</span>
                    <button
                      className="ib"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(sentence[0], { enabled: true });
                      }}
                    >
                      🔊
                    </button>
                  </div>
                  <button
                    className="rvb"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReveal('sentence');
                    }}
                  >
                    {revealed.sentence ? '🙈 إخفاء ترجمة الجملة' : '👁️ إظهار ترجمة الجملة'}
                  </button>
                  {revealed.sentence && <div className="tr">{sentence[1]}</div>}
                </>
              )}
              <button
                className="rvb"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleReveal('grammar');
                }}
              >
                {revealed.grammar ? '🙈 إخفاء الملاحظة' : '📘 ملاحظة قواعدية'}
              </button>
              {revealed.grammar && <div className="tr gnote">{grammarNote}</div>}
              <small className="hint">اضغط على البطاقة لقلبها 🔄</small>
            </div>
            <div className="face back">
              <div className="cimg" style={{ fontSize: 64 }}>
                {word.emoji}
              </div>
              <div className="cw">{word.en}</div>
              <div className="bt">{word.ar}</div>
              <small>{LANGS[lang]}</small>
              <small className="hint">اضغط للعودة 🔄</small>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn blue" disabled={cardIndex === 0} onClick={() => next(-1)}>
            → السابق
          </button>
          <button className="btn" onClick={() => next(1)}>
            {cardIndex < n - 1 ? 'التالي ←' : '🎯 تدرّب الآن'}
          </button>
        </div>
      </div>
    </>
  );
}
