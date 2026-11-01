import { useEffect, useState } from 'react';
import { ProgressProvider, useProgress } from '@/state/ProgressContext';
import { applyTheme } from '@/components/SettingsView';
import { initAudioOnFirstClick } from '@/utils/speech';
import { setFxEnabled } from '@/utils/audio';
import type { TabKey, LessonMode } from '@/types/content';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ToastHost from '@/components/ToastHost';
import Modal from '@/components/Modal';
import Login from '@/components/Login';
import Home from '@/components/Home';
import Quests from '@/components/Quests';
import Leaderboard from '@/components/Leaderboard';
import Shop from '@/components/Shop';
import Profile from '@/components/Profile';
import SettingsView from '@/components/SettingsView';
import Practice from '@/components/Practice';
import StudyCards from '@/components/StudyCards';
import LessonPlayer from '@/components/LessonPlayer';
import LessonFinish from '@/components/LessonFinish';
import { PATH_NAMES, PATH_COUNTS, PATH_STARTS, pathOf, unitStartLesson } from '@/content/catalog';

type Screen = 'main' | 'lesson' | 'finish' | 'study' | 'settings' | 'paths';

function AppInner() {
  const { state, username, logout } = useProgress();
  const [tab, setTab] = useState<TabKey>('h');
  const [screen, setScreen] = useState<Screen>('main');
  const [lessonIndex, setLessonIndex] = useState(0);
  const [lessonMode, setLessonMode] = useState<LessonMode>('lesson');
  const [unitIndex, setUnitIndex] = useState<number | undefined>(undefined);
  const [practiceMistakesOnly, setPracticeMistakesOnly] = useState(false);
  const [finishData, setFinishData] = useState({ perfect: false, xp: 0, wrong: 0 });
  const [showUnitTestModal, setShowUnitTestModal] = useState<number | null>(null);

  useEffect(() => {
    applyTheme(state.settings.th);
  }, [state.settings.th]);

  useEffect(() => {
    setFxEnabled(() => state.settings.fx === 1);
  }, [state.settings.fx]);

  useEffect(() => {
    document.addEventListener('click', initAudioOnFirstClick, { once: true });
    return () => document.removeEventListener('click', initAudioOnFirstClick);
  }, []);

  if (!username) {
    return (
      <div className="lingo-app">
        <Login />
        <ToastHost />
      </div>
    );
  }

  const goHome = () => {
    setScreen('main');
    setTab('h');
  };

  const startLesson = (idx: number) => {
    setLessonIndex(idx);
    setLessonMode('lesson');
    setUnitIndex(undefined);
    setScreen('lesson');
  };

  const startPractice = (mistakesOnly: boolean) => {
    setLessonMode('practice');
    setUnitIndex(undefined);
    setPracticeMistakesOnly(mistakesOnly);
    const doneLessons: number[] = [];
    for (let i = 0; i < ALL_LESSONS_COUNT; i++) {
      const p = pathOf(i);
      if ((state.pg[p] | 0) > i - PATH_STARTS[p]) doneLessons.push(i);
    }
    if (!doneLessons.length) return;
    setLessonIndex(doneLessons[0]);
    setScreen('lesson');
  };

  const startUnitTest = (ui: number) => {
    setUnitIndex(ui);
    setLessonMode('test');
    setLessonIndex(unitStartLesson(ui));
    setShowUnitTestModal(null);
    setScreen('lesson');
  };

  const handleLessonFinish = (perfect: boolean, xp: number, wrong: number) => {
    setFinishData({ perfect, xp, wrong });
    setScreen('finish');
  };

  const handleLessonFail = () => {
    setScreen('main');
    setTab('h');
  };

  if (screen === 'lesson') {
    return (
      <div className="lingo-app">
        <LessonPlayer
          lessonIndex={lessonIndex}
          mode={lessonMode}
          unitIndex={unitIndex}
          practiceMistakesOnly={practiceMistakesOnly}
          onExit={goHome}
          onFinish={handleLessonFinish}
          onFail={handleLessonFail}
        />
        <ToastHost />
      </div>
    );
  }

  if (screen === 'finish') {
    return (
      <div className="lingo-app">
        <LessonFinish
          perfect={finishData.perfect}
          xpGained={finishData.xp}
          wrongCount={finishData.wrong}
          mode={lessonMode}
          onStart={lessonIndex}
          onContinue={goHome}
          onRetry={() => {
            setScreen('lesson');
          }}
        />
        <ToastHost />
      </div>
    );
  }

  if (screen === 'study') {
    return (
      <div className="lingo-app">
        <StudyCards onBack={goHome} onPractice={(idx) => startLesson(idx)} />
        <ToastHost />
      </div>
    );
  }

  if (screen === 'settings') {
    return (
      <div className="lingo-app">
        <SettingsView onBack={goHome} />
        <ToastHost />
      </div>
    );
  }

  if (screen === 'paths') {
    return (
      <div className="lingo-app">
        <Modal onClose={goHome}>
          <h2>📚 اختر مسارك</h2>
          {PATH_NAMES.map((n, p) => (
            <button
              key={p}
              className={`btn${p === state.path ? '' : ' blue'}`}
              onClick={() => {
                setTab('h');
                setScreen('main');
              }}
            >
              {n} — {(state.pg[p] | 0)}/{PATH_COUNTS[p]}
            </button>
          ))}
          <button className="lnk" onClick={goHome}>
            إغلاق
          </button>
        </Modal>
        <ToastHost />
      </div>
    );
  }

  return (
    <div className="lingo-app">
      <Header />
      {tab === 'h' && (
        <Home
          tab={tab}
          onTab={setTab}
          onStartLesson={startLesson}
          onOpenPaths={() => setScreen('paths')}
          onOpenStudy={() => setScreen('study')}
          onUnitTest={(ui) => setShowUnitTestModal(ui)}
        />
      )}
      {tab === 'v' && <Practice onStartPractice={startPractice} />}
      {tab === 'q' && <Quests onComplete={() => setTab('h')} />}
      {tab === 'r' && <Leaderboard />}
      {tab === 's' && <Shop onHome={() => setTab('h')} />}
      {tab === 'm' && (
        <Profile
          onSettings={() => setScreen('settings')}
          onLogout={() => {
            logout();
          }}
        />
      )}
      <BottomNav tab={tab} onTab={setTab} />
      {showUnitTestModal !== null && (
        <Modal onClose={() => setShowUnitTestModal(null)}>
          <p>
            اختبار التخطي: أجب عن أسئلة الوحدة بالكامل ولديك 3 قلوب. عند النجاح تُفتح كل
            دروسها وتنتقل للوحدة التالية مباشرة 🚀
          </p>
          <button className="btn" onClick={() => startUnitTest(showUnitTestModal)}>
            🏁 ابدأ الاختبار
          </button>
        </Modal>
      )}
      <ToastHost />
    </div>
  );
}

const ALL_LESSONS_COUNT = 62;

export default function App() {
  return (
    <ProgressProvider>
      <AppInner />
    </ProgressProvider>
  );
}
