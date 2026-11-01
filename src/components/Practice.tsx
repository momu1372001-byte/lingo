import { useProgress } from '@/state/ProgressContext';
import { ALL_LESSONS, PATH_STARTS, pathOf } from '@/content/catalog';

interface PracticeProps {
  onStartPractice: (mistakesOnly: boolean) => void;
}

export default function Practice({ onStartPractice }: PracticeProps) {
  const { state } = useProgress();

  const lk = state.lock && state.lock > Date.now();
  const doneLessons = ALL_LESSONS.filter((_, i) => {
    const p = pathOf(i);
    return (state.pg[p] | 0) > i - PATH_STARTS[p];
  });
  const learnedWords = doneLessons.flatMap((l) => l.words).length;
  const mistakeWords = (state.mw || []).length;

  const fmtTime = () =>
    new Date(state.lock).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="pg">
      <h2>🔄 المراجعة</h2>
      <div className="card">
        <span style={{ fontSize: 34 }}>❤️</span>
        <div style={{ flex: 1 }}>
          <b>قلوب المراجعة: {state.hearts}/5</b>
          <br />
          <small style={{ color: 'var(--mut)' }}>
            {lk ? `نفدت القلوب — عُد الساعة ${fmtTime()}` : 'الأخطاء هنا تكلّف قلبًا. الدروس الجديدة بلا قلوب 💚'}
          </small>
        </div>
      </div>
      <div className="card">
        <span style={{ fontSize: 34 }}>🧠</span>
        <div style={{ flex: 1 }}>
          <b>مراجعة عامة</b>
          <br />
          <small style={{ color: 'var(--mut)' }}>{learnedWords} كلمة تعلمتها</small>
        </div>
        <button className="btn sm" onClick={() => onStartPractice(false)}>
          ابدأ
        </button>
      </div>
      <div className="card">
        <span style={{ fontSize: 34 }}>🎯</span>
        <div style={{ flex: 1 }}>
          <b>الكلمات الصعبة</b>
          <br />
          <small style={{ color: 'var(--mut)' }}>{mistakeWords} كلمة أخطأت فيها</small>
        </div>
        <button className="btn sm" onClick={() => onStartPractice(true)}>
          تدرّب
        </button>
      </div>
    </div>
  );
}
