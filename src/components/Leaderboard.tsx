import { useProgress, AVATARS } from '@/state/ProgressContext';

const BASE_BOARD: [string, number][] = [
  ['سارة', 340],
  ['أحمد', 280],
  ['ليلى', 230],
  ['عمر', 190],
  ['نور', 150],
  ['يوسف', 120],
  ['مريم', 90],
  ['خالد', 60],
  ['هند', 30],
];

export default function Leaderboard() {
  const { state, username } = useProgress();
  const board: [string, number][] = [
    ...BASE_BOARD,
    ['أنت', state.wk] as [string, number],
  ].sort((a, b) => b[1] - a[1]);

  const leagueName = state.wk >= 250 ? '🥇 الدوري الذهبي' : state.wk >= 100 ? '🥈 الدوري الفضي' : '🥉 الدوري البرونزي';

  return (
    <div className="pg">
      <h2>{leagueName}</h2>
      <p style={{ color: 'var(--mut)' }}>نقاط هذا الأسبوع — تنافس مع متعلمين آخرين</p>
      {board.map((n, i) => {
        const isMe = n[0] === 'أنت';
        const avatar = isMe ? state.av : AVATARS[((n[1] / 10) | 0) % 9];
        return (
          <div className={`card${isMe ? ' me' : ''}`} key={i}>
            <b>{['🥇', '🥈', '🥉'][i] || i + 1}</b>
            <span style={{ fontSize: 30 }}>{avatar}</span>
            <b style={{ flex: 1 }}>{isMe ? username || 'أنت' : n[0]}</b>
            <b>⚡ {n[1]}</b>
          </div>
        );
      })}
    </div>
  );
}
