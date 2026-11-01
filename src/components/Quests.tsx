import { useProgress } from '@/state/ProgressContext';
import { sfx } from '@/utils/audio';
import { confetti } from '@/utils/effects';

interface QuestDef {
  label: string;
  key: 'dxp' | 'ls' | 'pf';
  target: number;
  gems: number;
}

const DAILY_QUESTS: QuestDef[] = [
  { label: 'اكسب 30 نقطة خبرة', key: 'dxp', target: 30, gems: 10 },
  { label: 'أكمل درسين', key: 'ls', target: 2, gems: 10 },
  { label: 'أنهِ درسا بلا أخطاء', key: 'pf', target: 1, gems: 15 },
];

interface QuestsProps {
  onComplete: () => void;
}

export default function Quests({ onComplete }: QuestsProps) {
  const { state, setState } = useProgress();

  const achievements: [string, string, boolean][] = [
    ['🌱', 'أول درس', state.tot >= 1],
    ['🔥', 'سلسلة 3 أيام', state.streak >= 3],
    ['⚡', '100 نقطة خبرة', state.xp >= 100],
    ['🌟', 'درس مثالي', state.pfa >= 1],
    ['💎', '200 جوهرة', state.gems >= 200],
    ['🏅', '10 دروس', state.tot >= 10],
  ];

  const claim = (i: number, gems: number) => {
    setState((prev) => ({
      ...prev,
      cl: [...prev.cl, i],
      gems: prev.gems + gems,
    }));
    sfx.pair();
    confetti();
    onComplete();
  };

  return (
    <div className="pg">
      <h2>🎯 مهام اليوم</h2>
      {DAILY_QUESTS.map((q, i) => {
        const current = state[q.key] as number;
        const done = current >= q.target;
        const claimed = state.cl.includes(i);
        return (
          <div className="card" key={i}>
            <div style={{ flex: 1 }}>
              <b>{q.label}</b>
              <div className="pb" style={{ marginTop: 8 }}>
                <i
                  style={{
                    width: `${Math.min(100, (current / q.target) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <button
              className="btn sm"
              disabled={claimed || !done}
              onClick={() => claim(i, q.gems)}
            >
              {claimed ? '✓' : done ? `💎 ${q.gems}` : `${Math.min(current, q.target)}/${q.target}`}
            </button>
          </div>
        );
      })}
      <h2>🏅 الإنجازات</h2>
      <div className="ach">
        {achievements.map((a, i) => (
          <div className={a[2] ? '' : 'off'} key={i}>
            <span>{a[0]}</span>
            {a[1]}
          </div>
        ))}
      </div>
    </div>
  );
}
