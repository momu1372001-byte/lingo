import { useMemo } from 'react';
import { useProgress } from '@/state/ProgressContext';
import { toast } from '@/utils/toast';
import { sfx } from '@/utils/audio';
import {
  ALL_UNITS,
  ALL_LESSONS,
  PATH_NAMES,
  PATH_UNITS,
  PATH_STARTS,
  PATH_COUNTS,
  pathOf,
  unitStartLesson,
  unitEndLesson,
} from '@/content/catalog';
import type { TabKey } from '@/types/content';

interface HomeProps {
  tab: TabKey;
  onTab: (tab: TabKey) => void;
  onStartLesson: (lessonIndex: number) => void;
  onOpenPaths: () => void;
  onOpenStudy: () => void;
  onUnitTest: (unitIndex: number) => void;
}

function nodeState(
  lessonIndex: number,
  pg: number[],
  path: number,
  ut: Record<number, boolean>,
): 'done' | 'cur' | 'lock' {
  const p = pathOf(lessonIndex);
  const local = lessonIndex - PATH_STARTS[p];
  const done = pg[p] | 0;
  if (local < done) return 'done';
  if (local > done) return 'lock';
  const u = ALL_LESSONS[lessonIndex].unitIndex ?? 0;
  if (lessonIndex === unitStartLesson(u)) {
    const puIdx = PATH_UNITS[p].indexOf(u);
    if (puIdx > 0 && !tdUnitTest(PATH_UNITS[p][puIdx - 1], ut, pg)) return 'lock';
  }
  return 'cur';
}

function tdUnitTest(u: number, ut: Record<number, boolean>, pg: number[]): boolean {
  const p = pathOf(unitStartLesson(u));
  return !!ut[u] || (pg[p] | 0) > unitEndLesson(u) - PATH_STARTS[p];
}

function unitTestState(
  u: number,
  ut: Record<number, boolean>,
  pg: number[],
  path: number,
): string {
  const p = pathOf(unitStartLesson(u));
  if (tdUnitTest(u, ut, pg)) return 'done';
  if ((pg[p] | 0) >= unitEndLesson(u) - PATH_STARTS[p]) return 'cur';
  return 'lock sk';
}

export default function Home({ tab, onTab, onStartLesson, onOpenPaths, onOpenStudy, onUnitTest }: HomeProps) {
  const { state } = useProgress();
  const path = state.path;
  const dailyGoal = state.settings.goal;

  const nodes = useMemo(() => {
    let k = 0;
    return PATH_UNITS[path].map((uIdx) => {
      const unit = ALL_UNITS[uIdx];
      const items = unit.lessons.map((_, li) => {
        const lessonIndex = unitStartLesson(uIdx) + li;
        const st = nodeState(lessonIndex, state.pg, path, state.ut);
        const offset = [0, 45, 0, -45][k++ % 4];
        return { lessonIndex, st, offset, emoji: unit.lessons[li].emoji };
      });
      const ts = unitTestState(uIdx, state.ut, state.pg, path);
      const tOffset = [0, 45, 0, -45][k++ % 4];
      return { uIdx, unit, items, ts, tOffset };
    });
  }, [path, state.pg, state.ut]);

  const tapNode = (el: HTMLElement, lessonIndex: number) => {
    const st = nodeState(lessonIndex, state.pg, path, state.ut);
    if (st === 'lock') {
      el.classList.add('shake');
      sfx.bad();
      setTimeout(() => el.classList.remove('shake'), 400);
      toast('أكمل الدروس السابقة أولا 🔒');
      return;
    }
    onStartLesson(lessonIndex);
  };

  const dailyPercent = Math.min(100, (state.dxp / dailyGoal) * 100);

  return (
    <>
      <div className="pg">
        {tab === 'h' && (
          <>
            <div className="chip2" onClick={onOpenPaths}>
              📚 مساري: {PATH_NAMES[path]} ▾
            </div>
            <div className="goal">
              <div className="pb">
                <i style={{ width: `${dailyPercent}%`, background: 'var(--y)' }} />
              </div>
              <small>
                🎯 الهدف اليومي ⚡ {state.dxp}/{dailyGoal}
              </small>
            </div>
            <div className="lnk" style={{ margin: '8px auto 0' }} onClick={onOpenStudy}>
              📖 بطاقات التعلّم
            </div>
          </>
        )}
        {nodes.map(({ uIdx, unit, items, ts, tOffset }) => (
          <div key={uIdx}>
            <div className="unit" style={{ background: unit.color }}>
              <small>الوحدة {uIdx + 1}</small>
              {unit.title}
            </div>
            <div className="path">
              {items.map(({ lessonIndex, st, offset, emoji }) => (
                <button
                  key={lessonIndex}
                  className={`node ${st}`}
                  style={{ transform: `translateX(${offset}px)` }}
                  onClick={(e) => tapNode(e.currentTarget, lessonIndex)}
                >
                  {st === 'lock' ? '🔒' : st === 'done' ? '⭐' : emoji}
                  {st === 'cur' ? <span className="lb">ابدأ</span> : ''}
                </button>
              ))}
              <button
                className={`node ${ts}`}
                style={{ transform: `translateX(${tOffset}px)` }}
                onClick={() => onUnitTest(uIdx)}
              >
                {ts === 'done' ? '🏆' : ts === 'cur' ? '🏁' : '⏭️'}
                {ts === 'cur' ? (
                  <span className="lb">اختبار الوحدة</span>
                ) : ts[0] === 'l' ? (
                  <span className="lb" style={{ color: '#ce82ff' }}>
                    تخطَّ الوحدة
                  </span>
                ) : (
                  ''
                )}
              </button>
            </div>
          </div>
        ))}
        <div className="mascot">🦉</div>
      </div>
    </>
  );
}
