import { useProgress, AVATARS } from '@/state/ProgressContext';

interface ProfileProps {
  onSettings: () => void;
  onLogout: () => void;
}

export default function Profile({ onSettings, onLogout }: ProfileProps) {
  const { state, setState, username } = useProgress();

  const setAvatar = (av: string) => {
    setState((prev) => ({ ...prev, av }));
  };

  return (
    <div className="pg">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 80 }}>{state.av}</div>
        <h2>{username || 'ضيف'}</h2>
      </div>
      <div>
        {AVATARS.map((a) => (
          <button key={a} className="av" onClick={() => setAvatar(a)}>
            {a}
          </button>
        ))}
      </div>
      <div className="sg">
        <div>
          🔥 {state.streak}
          <br />
          <small>سلسلة</small>
        </div>
        <div>
          ⚡ {state.xp}
          <br />
          <small>نقاط</small>
        </div>
        <div>
          📚 {state.tot}
          <br />
          <small>دروس</small>
        </div>
        <div>
          💎 {state.gems}
          <br />
          <small>جواهر</small>
        </div>
      </div>
      <button className="btn blue" onClick={onSettings}>
        ⚙️ الإعدادات
      </button>
      <button
        className="btn"
        style={{ marginTop: 12, background: 'var(--r)', boxShadow: '0 5px 0 var(--rd)' }}
        onClick={onLogout}
      >
        🚪 تسجيل الخروج
      </button>
    </div>
  );
}
