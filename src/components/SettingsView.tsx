import { useProgress } from '@/state/ProgressContext';
import { speak } from '@/utils/speech';
import { toast } from '@/utils/toast';

interface SettingsViewProps {
  onBack: () => void;
}

const LANGS: Record<string, string> = {
  ar: 'العربية',
  fr: 'Français',
  hi: 'हिन्दी',
  es: 'Español',
};

export default function SettingsView({ onBack }: SettingsViewProps) {
  const { state, setState } = useProgress();
  const s = state.settings;

  const toggle = (key: 'snd' | 'fx' | 'slow') => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: prev.settings[key] ? 0 : 1 },
    }));
  };

  const setGoal = (goal: number) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, goal } }));
  };

  const setTheme = (th: 'auto' | 'light' | 'dark') => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, th } }));
    applyTheme(th);
  };

  const setLang = (lang: string) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, lang } }));
  };

  const reset = () => {
    if (confirm('سيتم مسح كل تقدمك. متأكد؟')) {
      setState((prev) => ({
        xp: 0,
        gems: 50,
        hearts: 5,
        streak: 0,
        last: '',
        pg: [0, 0, 0, 0, 0],
        path: 0,
        dxp: 0,
        ls: 0,
        pf: 0,
        dd: '',
        cl: [],
        fr: 0,
        bx: 0,
        av: '🦉',
        tot: 0,
        pfa: 0,
        wk: 0,
        ht: 0,
        lock: 0,
        ut: {},
        mw: [],
        settings: prev.settings,
      }));
      onBack();
    }
  };

  const testSound = () => {
    speak('Hello! Welcome to Lingo.', { enabled: true });
    toast('إن لم تسمع صوتا: ارفع صوت الجهاز وتأكد أنه ليس صامتا، أو جرّب Chrome');
  };

  return (
    <>
      <div className="lh">
        <button className="x" onClick={onBack}>
          →
        </button>
        <b style={{ fontSize: 20 }}>⚙️ الإعدادات</b>
      </div>
      <div className="pg" style={{ paddingTop: 0 }}>
        <div className="card" onClick={() => toggle('snd')}>
          <b style={{ flex: 1 }}>🔊 الصوت والنطق</b>
          <span className={`tgl${s.snd ? ' on' : ''}`} />
        </div>
        <div className="card" onClick={() => toggle('fx')}>
          <b style={{ flex: 1 }}>🎵 المؤثرات الصوتية</b>
          <span className={`tgl${s.fx ? ' on' : ''}`} />
        </div>
        <div className="card" onClick={() => toggle('slow')}>
          <b style={{ flex: 1 }}>🐢 نطق بطيء</b>
          <span className={`tgl${s.slow ? ' on' : ''}`} />
        </div>
        <div className="card">
          <b style={{ flex: 1 }}>🎯 الهدف اليومي</b>
          {[20, 30, 50].map((g) => (
            <button
              key={g}
              className={`seg${s.goal === g ? ' on' : ''}`}
              onClick={() => setGoal(g)}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="card">
          <b style={{ flex: 1 }}>🌓 المظهر</b>
          {(['auto', 'light', 'dark'] as const).map((x) => (
            <button
              key={x}
              className={`seg${s.th === x ? ' on' : ''}`}
              onClick={() => setTheme(x)}
            >
              {x === 'auto' ? 'تلقائي' : x === 'light' ? 'فاتح' : 'داكن'}
            </button>
          ))}
        </div>
        <div className="card">
          <b style={{ flex: 1 }}>🌐 لغتك (لغة الترجمة)</b>
          {Object.keys(LANGS).map((k) => (
            <button
              key={k}
              className={`seg${(s.lang || 'ar') === k ? ' on' : ''}`}
              onClick={() => setLang(k)}
            >
              {LANGS[k]}
            </button>
          ))}
        </div>
        <button className="btn blue" onClick={testSound}>
          🔈 اختبار الصوت
        </button>
        <button
          className="btn"
          style={{ marginTop: 14, background: 'var(--r)', boxShadow: '0 5px 0 var(--rd)' }}
          onClick={reset}
        >
          🗑️ إعادة تعيين التقدم
        </button>
      </div>
    </>
  );
}

export function applyTheme(th: 'auto' | 'light' | 'dark') {
  if (th === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = th;
}
