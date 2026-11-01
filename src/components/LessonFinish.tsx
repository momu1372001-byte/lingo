import { useEffect } from 'react';
import { useProgress } from '@/state/ProgressContext';
import { sfx } from '@/utils/audio';
import { burst, flashScreen } from '@/utils/effects';
import { speak } from '@/utils/speech';
import type { LessonMode } from '@/types/content';

interface LessonFinishProps {
  perfect: boolean;
  xpGained: number;
  wrongCount: number;
  mode: LessonMode;
  onStart: number;
  onContinue: () => void;
  onRetry: () => void;
}

export default function LessonFinish({ perfect, xpGained, wrongCount, mode, onStart: _onStart, onContinue, onRetry }: LessonFinishProps) {
  const { state } = useProgress();

  useEffect(() => {
    const rank = wrongCount <= 1 ? 2 : wrongCount <= 3 ? 1 : 0;
    const stars = rank === 2 ? 3 : rank === 1 ? 2 : 1;

    [0, 1, 2].forEach((i) => setTimeout(() => (i < stars ? sfx.star(i) : sfx.nostar()), 800 + i * 500));

    if (rank === 2) {
      sfx.fan();
      flashScreen('rgba(255,200,0,.4)');
      burst(90, innerWidth / 2, innerHeight * 0.4, { pow: 14, spread: 6.3 });
      setTimeout(() => {
        burst(60, 0, innerHeight, { ang: -0.9, spread: 0.8, pow: 18 });
        burst(60, innerWidth, innerHeight, { ang: -2.25, spread: 0.8, pow: 18 });
      }, 500);
      sfx.vibrateFan();
      setTimeout(() => speak('Perfect! Great job!', { enabled: state.settings.snd === 1 }), 1300);
    } else if (rank === 1) {
      sfx.mid();
      burst(45, innerWidth / 2, innerHeight * 0.4, { pow: 11, spread: 6.3 });
      sfx.vibrateMid();
      setTimeout(() => speak('Good job!', { enabled: state.settings.snd === 1 }), 900);
    } else {
      sfx.sad();
      burst(40, 0, 0, { sad: true });
      flashScreen('rgba(40,50,70,.55)');
      sfx.vibrateSad();
      setTimeout(() => speak('Try again!', { enabled: state.settings.snd === 1 }), 1700);
    }
  }, []);

  const rank = wrongCount <= 1 ? 2 : wrongCount <= 3 ? 1 : 0;
  const stars = rank === 2 ? 3 : rank === 1 ? 2 : 1;
  const medals = ['💔', '🥈', '🏆'];
  const titles = ['احتفال حزين', 'احتفال جميل!', 'احتفال أسطوري!'];
  const messages = [
    'لا بأس.. الأخطاء تعلّمنا. أعد المحاولة وستتحسن!',
    'أداء جيد! بقليل من التركيز ستصل للكمال',
    'أداء مثالي! أنت نجم اللغة الإنجليزية 🌟',
  ];
  const medalClass = rank === 2 ? '' : rank === 1 ? 'mid' : 'sad';

  return (
    <>
      <div className="fin">
        <div className="mascot">
          <span className={`medal ${medalClass}`}>{medals[rank]}</span>
        </div>
        <h2 style={{ fontSize: 28, color: rank === 2 ? 'var(--y)' : rank === 1 ? 'var(--b)' : '#6b7c85' }}>
          {titles[rank]}
        </h2>
        <p>
          {messages[rank]}
          <br />
          {perfect ? 'درس مثالي! 🌟' : 'عمل رائع، واصل التقدم!'}
        </p>
        <div className="stars">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="s3"
              style={{ animationDelay: `${0.8 + i * 0.5}s` }}
            >
              {i < stars ? '⭐' : '☆'}
            </span>
          ))}
        </div>
        <div className="stats">
          <div className="st">
            <small>نقاط الخبرة</small>
            <div>⚡ {xpGained}</div>
          </div>
          <div className="st" style={{ borderColor: 'var(--b)' }}>
            <small style={{ background: 'var(--b)' }}>جواهر</small>
            <div>💎 {5 + (perfect ? 3 : 0)}</div>
          </div>
          <div className="st" style={{ borderColor: 'var(--r)' }}>
            <small style={{ background: 'var(--r)' }}>السلسلة</small>
            <div>🔥 {state.streak}</div>
          </div>
        </div>
        {mode === 'test' && (
          <div className="lvl" style={{ animationDelay: '0.2s', marginBottom: 14 }}>
            🔓 اجتزت اختبار الوحدة! فُتحت الوحدة التالية (+20💎)
          </div>
        )}
      </div>
      <div className="ft">
        {rank === 0 && (
          <button
            className="btn blue"
            style={{ marginBottom: 10 }}
            onClick={onRetry}
          >
            🔁 أعد الدرس
          </button>
        )}
        <button className="btn" onClick={onContinue}>
          متابعة
        </button>
      </div>
    </>
  );
}
