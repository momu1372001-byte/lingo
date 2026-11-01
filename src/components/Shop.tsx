import { useProgress } from '@/state/ProgressContext';
import { sfx } from '@/utils/audio';
import { toast } from '@/utils/toast';

interface ShopProps {
  onHome: () => void;
}

export default function Shop({ onHome }: ShopProps) {
  const { state, setState } = useProgress();

  const buy = (key: string, price: number) => {
    if (state.gems < price) {
      toast('جواهرك لا تكفي 💎');
      return;
    }
    if (key === 'f' && state.fr >= 2) {
      toast('لديك الحد الأقصى');
      return;
    }
    setState((prev) => {
      const next = { ...prev, gems: prev.gems - price };
      if (key === 'h') next.hearts = 5;
      if (key === 'h') next.lock = 0;
      if (key === 'f') next.fr += 1;
      if (key === 'b') next.bx = 1;
      return next;
    });
    sfx.pair();
    toast('تم الشراء ✅');
    onHome();
  };

  const items: [string, string, string, string, number][] = [
    ['❤️', 'تعبئة القلوب', '5 قلوب كاملة (وقلب كل 5 دقائق مجانا)', 'h', 50],
    ['🧊', `حماية السلسلة (لديك ${state.fr})`, 'تنقذ سلسلتك إذا فاتك يوم', 'f', 100],
    ['🚀', state.bx ? 'مضاعف نقاط (مفعّل ✅)' : 'مضاعف نقاط', 'يضاعف نقاط الدرس القادم', 'b', 60],
  ];

  return (
    <div className="pg">
      <h2>🛒 المتجر</h2>
      {items.map((item, i) => (
        <div className="card" key={i}>
          <span style={{ fontSize: 36 }}>{item[0]}</span>
          <div style={{ flex: 1 }}>
            <b>{item[1]}</b>
            <br />
            <small style={{ color: 'var(--mut)' }}>{item[2]}</small>
          </div>
          <button className="btn sm" onClick={() => buy(item[3], item[4])}>
            💎 {item[4]}
          </button>
        </div>
      ))}
    </div>
  );
}
