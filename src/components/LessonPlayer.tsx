import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@/state/ProgressContext';
import { ALL_WORDS, ALL_LESSONS, SENTENCE_WORDS, FILL_BLANKS, pathOf, PATH_STARTS, unitStartLesson, unitEndLesson } from '@/content/catalog';
import type { Word, Sentence, LessonMode } from '@/types/content';
import { shuffle } from '@/utils/shuffle';
import { buildQuestions, type Question } from '@/utils/questionBuilder';
import { sfx } from '@/utils/audio';
import { speak } from '@/utils/speech';
import { confetti } from '@/utils/effects';
import { toast } from '@/utils/toast';
import Modal from '@/components/Modal';

interface SpeechResultLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  onresult: (e: SpeechResultLike) => void;
  onerror: () => void;
  start: () => void;
}

interface LessonPlayerProps {
  lessonIndex: number;
  mode: LessonMode;
  unitIndex?: number;
  onExit: () => void;
  onFinish: (perfect: boolean, xpGained: number) => void;
  onFail: () => void;
}

const PRAISE = ['ممتاز! 🎉', 'رائع!', 'أحسنت!', 'إجابة صحيحة!'];

export default function LessonPlayer({ lessonIndex, mode, unitIndex, onExit, onFinish, onFail }: LessonPlayerProps) {
  const { state, setState } = useProgress();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [hearts, setHearts] = useState(mode === 'practice' ? state.hearts : mode === 'test' ? 3 : 99);
  const [selected, setSelected] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState<null | { ok: boolean; answer: string }>(null);
  const [bankAns, setBankAns] = useState<string[]>([]);
  const [bankUsed, setBankUsed] = useState<Record<number, boolean>>({});
  const [bankOrder, setBankOrder] = useState<number[]>([]);
  const [mtSel, setMtSel] = useState<HTMLElement | null>(null);
  const [mtMatched, setMtMatched] = useState(0);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showOutModal, setShowOutModal] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const q = questions[qIndex];
  const total = questions.length;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    init();
  }, []);

  function init() {
    let words: Word[];
    let sentences: Sentence[];
    let pool: Word[];

    if (mode === 'practice') {
      const doneLessons = ALL_LESSONS.filter((_, i) => {
        const p = pathOf(i);
        return (state.pg[p] | 0) > i - PATH_STARTS[p];
      });
      words = shuffle(doneLessons.flatMap((l) => l.words)).slice(0, 5);
      sentences = shuffle(doneLessons.flatMap((l) => l.sentences)).slice(0, 2);
      pool = ALL_WORDS;
    } else if (mode === 'test' && unitIndex !== undefined) {
      const unit = ALL_LESSONS.filter((l) => l.unitIndex === unitIndex);
      words = shuffle(unit.flatMap((l) => l.words)).slice(0, 5);
      sentences = shuffle(unit.flatMap((l) => l.sentences)).slice(0, 2);
      pool = ALL_WORDS;
    } else {
      const lesson = ALL_LESSONS[lessonIndex];
      words = shuffle(lesson.words);
      sentences = lesson.sentences;
      pool = shuffle(ALL_WORDS.filter((x) => !lesson.words.includes(x)));
    }

    const qs = buildQuestions(words, sentences, pool, SENTENCE_WORDS, FILL_BLANKS, lessonIndex);
    setQuestions(qs);
  }

  const grammarNote =
    q && q.c
      ? (ALL_LESSONS[lessonIndex] as unknown as { grammarNotes?: string[] }).grammarNotes?.[0] ||
        'الصفة تأتي قبل الاسم: a red car. وبعد الأرقام الأكبر من واحد يأخذ الاسم s: two cats.'
      : '';

  const heartDisplay = mode === 'test' ? `❤️ ${hearts}/3` : mode === 'practice' ? `❤️ ${hearts}` : '❤️ ∞';

  function handleSpeak(text: string) {
    speak(text, { enabled: state.settings.snd === 1, slow: state.settings.slow === 1 });
  }

  function pick(i: number) {
    setSelected(i);
  }

  function checkAnswer() {
    if (!q) return;

    if (q.y === 'bk' || q.y === 'sc') {
      const ans = q.y === 'bk' ? bankAns.join(' ') : bankAns.join('');
      const correct = q.y === 'bk' ? (q.s as Sentence).en : (q.a as string);
      return res(ans === correct, correct);
    }

    if (!q.o) {
      const v = inputVal.trim().toLowerCase().replace(/[^a-z' ]/g, '');
      return res(v === (q.a as string).toLowerCase(), q.a as string);
    }

    const o = q.o[selected as number];
    const correctOpt = q.o.find((x) => x.ok);
    res(o?.ok ?? false, correctOpt?.t ?? '');
  }

  function res(ok: boolean, answer: string) {
    if (ok) {
      sfx.ok(1);
    } else {
      sfx.bad();
    }

    if (ok) {
      setDone((d) => d + 1);
      // Track mistaken word removal
      if (q && q.c) {
        setState((prev) => ({
          ...prev,
          mw: (prev.mw || []).filter((e) => e !== q.c!.en),
        }));
      }
    } else {
      setWrong((w) => w + 1);
      if (mode !== 'lesson') {
        setHearts((h) => h - 1);
      }
      if (q && q.c) {
        setState((prev) => {
          const mw = prev.mw || [];
          if (!mw.includes(q.c!.en)) mw.push(q.c!.en);
          return { ...prev, mw: mw.slice(-30) };
        });
      }
      // Re-add question
      setQuestions((qs) => [...qs, q]);
    }

    setResult({ ok, answer });

    if (mode !== 'lesson' && ok === false && hearts - 1 <= 0) {
      setTimeout(() => {
        if (mode === 'test') {
          onFail();
        } else {
          setShowOutModal(true);
        }
      }, 1500);
    }
  }

  function continueNext() {
    setResult(null);
    setSelected(null);
    setInputVal('');
    setBankAns([]);
    setBankUsed({});
    setBankOrder([]);
    setMtSel(null);
    setMtMatched(0);
    setShowGrammar(false);
    setQIndex((i) => i + 1);

    if (qIndex + 1 >= total) {
      finishLesson();
    }
  }

  function finishLesson() {
    const perfect = wrong === 0;
    const xpBase = 10 + (perfect ? 5 : 0);
    let xp = xpBase;
    if (state.bx) xp *= 2;

    setState((prev) => {
      const next = { ...prev };
      next.xp += xp;
      next.dxp += xp;
      next.wk += xp;
      next.gems += 5 + (perfect ? 3 : 0);
      next.ls += 1;
      next.tot += 1;
      if (perfect) {
        next.pf += 1;
        next.pfa += 1;
      }
      if (mode === 'lesson') {
        const p = pathOf(lessonIndex);
        const lc = lessonIndex - PATH_STARTS[p];
        if (lc === (next.pg[p] | 0)) next.pg[p] = lc + 1;
      }
      if (mode === 'test' && unitIndex !== undefined) {
        next.ut = { ...next.ut, [unitIndex]: true };
        const p = pathOf(unitStartLesson(unitIndex));
        next.pg[p] = Math.max(next.pg[p] | 0, unitEndLesson(unitIndex) - PATH_STARTS[p]);
        next.gems += 20;
      }
      // Streak
      const t = new Date().toDateString();
      const y = new Date(Date.now() - 864e5).toDateString();
      if (next.last !== t) {
        if (next.last === y) next.streak += 1;
        else if (next.last === new Date(Date.now() - 864e5 * 2).toDateString() && next.fr > 0) {
          next.fr -= 1;
          next.streak += 1;
        } else next.streak = 1;
        next.last = t;
      }
      return next;
    });

    confetti();
    sfx.ok(1);
    onFinish(perfect, xp);
  }

  function handleSpeech() {
    const w = window as unknown as {
      SpeechRecognition?: { new (): SpeechRecognitionLike };
      webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
    };
    const R = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!R) {
      setResult({ ok: true, answer: q?.a || '' });
      return;
    }
    const r = new R();
    r.lang = 'en-US';
    r.onresult = (e: SpeechResultLike) => {
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);
      const t = norm(e.results[0][0].transcript);
      const w = norm(q?.a || '');
      res(w.filter((x) => t.includes(x)).length / w.length >= 0.5, q?.a || '');
    };
    r.onerror = () => {
      setResult({ ok: true, answer: q?.a || '' });
    };
    r.start();
  }

  if (!q) {
    return null;
  }

  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <>
      <div className="lh">
        <button className="x" onClick={() => { if (confirm('ستفقد تقدمك في هذا الدرس. هل تريد الخروج؟')) onExit(); }}>
          ✕
        </button>
        <div className="pb">
          <i style={{ width: `${progress}%` }} />
        </div>
        <span>{heartDisplay}</span>
      </div>

      <div className="body" ref={bodyRef}>
        {renderQuestion()}
        {showGrammar && grammarNote && (
          <div className="tr gnote" style={{ marginTop: 10 }}>{grammarNote}</div>
        )}
        {grammarNote && !showGrammar && (
          <button className="lnk" onClick={() => setShowGrammar(true)}>📘 إظهار الملاحظة القواعدية</button>
        )}
      </div>

      <div className={`ft${result ? (result.ok ? ' ok' : ' bad') : ''}`}>
        {result ? (
          <>
            <b>
              {result.ok
                ? shuffle(PRAISE)[0]
                : <>الإجابة الصحيحة:<br /><span dir="ltr" style={{ fontWeight: 600 }}>{result.answer}</span></>}
            </b>
            <button className="btn" onClick={continueNext}>متابعة</button>
          </>
        ) : q.y === 'mt' ? null : q.y === 'sp' ? (
          <button
            className="btn"
            style={{ background: 'var(--bd)', color: 'var(--tx)', boxShadow: '0 5px 0 var(--mut)' }}
            onClick={() => { setDone((d) => d + 1); setQIndex((i) => i + 1); if (qIndex + 1 >= total) finishLesson(); }}
          >
            تخطي
          </button>
        ) : (
          <button
            className="btn"
            id="ck"
            disabled={!canCheck()}
            onClick={checkAnswer}
          >
            تحقق
          </button>
        )}
      </div>

      {showOutModal && (
        <Modal onClose={() => { setShowOutModal(false); onExit(); }}>
          <div className="mascot">💔</div>
          <h2>نفدت قلوب المراجعة!</h2>
          <button className="btn blue" onClick={() => {
            if (state.gems < 50) { toast('جواهرك لا تكفي 💎'); return; }
            setState((prev) => ({ ...prev, gems: prev.gems - 50, hearts: 5, lock: 0 }));
            setShowOutModal(false);
            onExit();
          }}>
            💎 املأ القلوب (50 جوهرة)
          </button>
          <button className="btn" onClick={() => { setShowOutModal(false); onExit(); }}>
            العودة للرئيسية
          </button>
        </Modal>
      )}
    </>
  );

  function canCheck(): boolean {
    if (q.y === 'bk' || q.y === 'sc') return bankAns.length > 0;
    if (q.o) return selected !== null;
    return inputVal.trim().length > 0;
  }

  function renderQuestion() {
    if (q.y === 'mc' || q.y === 'ls' || q.y === 'mc2') {
      const en = q.y !== 'mc2';
      return (
        <>
          {q.y === 'mc' && (
            <>
              <h2>ما معنى هذه الكلمة؟</h2>
              <div className="emo">{q.c!.emoji}</div>
              <div className="big">{q.c!.en}</div>
              <button className="spk" onClick={() => handleSpeak(q.c!.en)}>🔊</button>
            </>
          )}
          {q.y === 'ls' && (
            <>
              <h2>ماذا سمعت؟</h2>
              <button
                className="spk"
                style={{ width: 100, height: 100, fontSize: 46, background: 'var(--b)', borderColor: 'var(--bdk)' }}
                onClick={() => handleSpeak(q.c!.en)}
              >
                🔊
              </button>
            </>
          )}
          {q.y === 'mc2' && (
            <>
              <h2>اختر الترجمة الصحيحة</h2>
              <div className="emo">{q.c!.emoji}</div>
              <div className="big" dir="rtl">{q.c!.ar}</div>
            </>
          )}
          <div className="opts">
            {q.o!.map((o, i) => (
              <button
                key={i}
                className={`opt${en ? '' : ' en'}${selected === i ? ' sel' : ''}`}
                onClick={() => pick(i)}
              >
                {q.y === 'mc' ? '' : (o.e ?? '') + ' '}
                {o.t}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (q.y === 'mt') {
      const E = shuffle(q.p!.map((p) => p.en));
      const A = shuffle(q.p!.map((p) => p.ar));
      return (
        <>
          <h2>طابق الأزواج</h2>
          <div className="mt">
            <div className="opts" style={{ margin: 0 }}>
              {E.map((t) => (
                <button
                  key={t}
                  className="opt en"
                  data-s="e"
                  data-v={t}
                  onClick={(e) => mtClick(e.currentTarget)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="opts" style={{ margin: 0 }}>
              {A.map((t) => (
                <button
                  key={t}
                  className="opt"
                  data-s="a"
                  data-v={t}
                  onClick={(e) => mtClick(e.currentTarget)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </>
      );
    }

    if (q.y === 'bk') {
      const ws = (q.s as Sentence).en.split(' ');
      const extras = shuffle(['the', 'is', 'a', 'you', 'we', 'am', 'not'])
        .filter((x) => !ws.map((w) => w.toLowerCase()).includes(x))
        .slice(0, 2);
      const bank = shuffle([...ws, ...extras]);
      return (
        <>
          <h2>ترجم هذه الجملة</h2>
          <div style={{ fontSize: 22, fontWeight: 700, padding: 10, border: '2px solid var(--bd)', borderRadius: 14 }}>
            🦉 {(q.s as Sentence).ar}
          </div>
          <div className="ans">
            {bankAns.map((w, i) => (
              <button key={i} className="chip" onClick={() => removeChip(i)}>{w}</button>
            ))}
          </div>
          <div className="bank">
            {bank.map((w, i) => (
              <button
                key={i}
                className={`chip${bankUsed[i] ? ' empty' : ''}`}
                onClick={() => addChip(i, w)}
              >
                {w}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (q.y === 'pic') {
      return (
        <>
          <h2>اختر الصورة المناسبة</h2>
          <div className="big">{q.c!.en}</div>
          <button className="spk" onClick={() => handleSpeak(q.c!.en)}>🔊</button>
          <div className="opts pic" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {q.o!.map((o, i) => (
              <button
                key={i}
                className={`opt${selected === i ? ' sel' : ''}`}
                onClick={() => pick(i)}
              >
                {o.t}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (q.y === 'fi' || q.y === 'lf') {
      return (
        <>
          <h2>{q.y === 'fi' ? 'أكمل الجملة' : 'استمع وأكمل الكلمة الناقصة'}</h2>
          {q.y === 'lf' && (
            <button className="spk" onClick={() => handleSpeak(q.full || '')}>🔊</button>
          )}
          <div className="big" style={{ fontSize: 24 }}>{q.template}</div>
          <p style={{ textAlign: 'center', color: 'var(--mut)' }}>{q.ar}</p>
          {q.o ? (
            <div className="opts">
              {q.o.map((o, i) => (
                <button
                  key={i}
                  className={`opt en${selected === i ? ' sel' : ''}`}
                  onClick={() => pick(i)}
                >
                  {o.t}
                </button>
              ))}
            </div>
          ) : (
            <input
              className="inp"
              dir="ltr"
              autoComplete="off"
              autoCapitalize="off"
              placeholder="اكتب هنا..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
          )}
        </>
      );
    }

    if (q.y === 'wr') {
      return (
        <>
          <h2>اكتب بالإنجليزية</h2>
          <div className="emo">{q.c!.emoji}</div>
          <div className="big" dir="rtl">{q.c!.ar}</div>
          <input
            className="inp"
            dir="ltr"
            autoComplete="off"
            autoCapitalize="off"
            placeholder="اكتب هنا..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
        </>
      );
    }

    if (q.y === 'sp') {
      return (
        <>
          <h2>انطق هذه الجملة</h2>
          <div className="big" style={{ fontSize: 26 }}>{q.a}</div>
          <p style={{ textAlign: 'center', color: 'var(--mut)' }}>{q.ar}</p>
          <button className="spk" onClick={() => handleSpeak(q.a!)}>🔊</button>
          <button
            className="spk"
            style={{ width: 90, height: 90, fontSize: 38, background: 'var(--b)', borderColor: 'var(--bdk)' }}
            onClick={handleSpeech}
          >
            🎤
          </button>
        </>
      );
    }

    if (q.y === 'tf') {
      return (
        <>
          <h2>صح أم خطأ؟</h2>
          <div className="emo">{q.c!.emoji}</div>
          <div className="big">{q.c!.en}</div>
          <button className="spk" onClick={() => handleSpeak(q.c!.en)}>🔊</button>
          <p style={{ textAlign: 'center', fontSize: 20 }}>
            تعني: <b>{q.m!.ar}</b>
          </p>
          <div className="opts">
            {q.o!.map((o, i) => (
              <button key={i} className={`opt${selected === i ? ' sel' : ''}`} onClick={() => pick(i)}>
                {o.t}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (q.y === 'sc') {
      const letters = (q.a as string).split('');
      const bank = shuffle(letters);
      return (
        <>
          <h2>رتّب الحروف لتكوين الكلمة</h2>
          <div className="emo">{q.c!.emoji}</div>
          <div className="big" dir="rtl">{q.c!.ar}</div>
          <div className="ans">
            {bankAns.map((w, i) => (
              <button key={i} className="chip" onClick={() => removeChip(i)}>{w}</button>
            ))}
          </div>
          <div className="bank">
            {bank.map((w, i) => (
              <button
                key={i}
                className={`chip${bankUsed[i] ? ' empty' : ''}`}
                onClick={() => addChip(i, w)}
              >
                {w}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (q.y === 'ts') {
      return (
        <>
          <h2>اكتب الجملة بالإنجليزية</h2>
          <div style={{ fontSize: 22, fontWeight: 700, padding: 10, border: '2px solid var(--bd)', borderRadius: 14 }}>
            🦉 {q.ar}
          </div>
          <input
            className="inp"
            dir="ltr"
            autoComplete="off"
            autoCapitalize="off"
            placeholder="اكتب هنا..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
        </>
      );
    }

    if (q.y === 'lt') {
      return (
        <>
          <h2>استمع واختر الترجمة</h2>
          <button
            className="spk"
            style={{ width: 100, height: 100, fontSize: 46, background: 'var(--b)', borderColor: 'var(--bdk)' }}
            onClick={() => handleSpeak(q.full || '')}
          >
            🔊
          </button>
          <div className="opts">
            {q.o!.map((o, i) => (
              <button key={i} className={`opt${selected === i ? ' sel' : ''}`} onClick={() => pick(i)}>
                {o.t}
              </button>
            ))}
          </div>
          <button className="lnk" onClick={() => { setDone((d) => d + 1); setQIndex((i) => i + 1); if (qIndex + 1 >= total) finishLesson(); }}>
            🔇 لا أستطيع الاستماع الآن
          </button>
        </>
      );
    }

    return null;
  }

  function addChip(i: number, w: string) {
    if (bankUsed[i]) return;
    setBankUsed((prev) => ({ ...prev, [i]: true }));
    setBankAns((prev) => [...prev, w]);
    setBankOrder((prev) => [...prev, i]);
  }

  function removeChip(i: number) {
    const bi = bankOrder[i];
    setBankUsed((prev) => {
      const next = { ...prev };
      delete next[bi];
      return next;
    });
    setBankAns((prev) => prev.filter((_, j) => j !== i));
    setBankOrder((prev) => prev.filter((_, j) => j !== i));
  }

  function mtClick(el: HTMLElement) {
    if (mtSel && mtSel.dataset.s === el.dataset.s) {
      mtSel.classList.remove('sel');
      setMtSel(el);
      el.classList.add('sel');
      return;
    }
    if (!mtSel) {
      setMtSel(el);
      el.classList.add('sel');
      if (el.dataset.s === 'e') handleSpeak(el.dataset.v || '');
      return;
    }
    const a = mtSel;
    setMtSel(null);
    a.classList.remove('sel');
    const e = a.dataset.s === 'e' ? a : el;
    const r = a.dataset.s === 'e' ? el : a;
    const matched = q.p!.some((p) => p.en === e.dataset.v && p.ar === r.dataset.v);
    if (matched) {
      sfx.pair();
      e.classList.add('ok');
      r.classList.add('ok');
      handleSpeak(e.dataset.v || '');
      setMtMatched((m) => {
        const nm = m + 1;
        if (nm === q.p!.length) {
          setDone((d) => d + 1);
          setTimeout(() => {
            setQIndex((i) => i + 1);
            if (qIndex + 1 >= total) finishLesson();
          }, 800);
        }
        return nm;
      });
    } else {
      sfx.bad();
      [a, el].forEach((x) => {
        x.classList.add('bad');
        setTimeout(() => x.classList.remove('bad'), 400);
      });
      if (mode !== 'lesson') {
        setHearts((h) => {
          const nh = h - 1;
          if (nh <= 0 && mode === 'test') setTimeout(onFail, 500);
          else if (nh <= 0 && mode === 'practice') setTimeout(() => setShowOutModal(true), 500);
          return nh;
        });
      }
    }
  }
}
