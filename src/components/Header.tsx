import { useProgress } from '@/state/ProgressContext';

export default function Header() {
  const { state } = useProgress();
  return (
    <div className="lingo-top">
      <span>🔥 {state.streak}</span>
      <span>💎 {state.gems}</span>
      <span>⚡ {state.xp}</span>
      <span>❤️ {state.hearts}</span>
    </div>
  );
}
