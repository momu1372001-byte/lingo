import type { TabKey } from '@/types/content';

interface BottomNavProps {
  tab: TabKey;
  onTab: (tab: TabKey) => void;
}

const TABS: [TabKey, string, string][] = [
  ['h', '🏠', 'الرئيسية'],
  ['v', '🔄', 'المراجعة'],
  ['q', '🎯', 'المهام'],
  ['r', '🏆', 'الترتيب'],
  ['s', '🛒', 'المتجر'],
  ['m', '👤', 'حسابي'],
];

export default function BottomNav({ tab, onTab }: BottomNavProps) {
  return (
    <nav className="lingo-nav">
      {TABS.map(([key, icon, label]) => (
        <button
          key={key}
          className={tab === key ? 'on' : ''}
          onClick={() => onTab(key)}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}
