import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ProgressState, Settings } from '@/types/content';

const AVATARS = ['🦉', '🐱', '🦊', '🐼', '🦁', '🐸', '🐵', '🦄', '🐯'];

function defaultState(): ProgressState {
  return {
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
    settings: { snd: 1, fx: 1, slow: 0, goal: 30, th: 'auto', lang: 'ar' },
  };
}

function defaultSettings(): Settings {
  return { snd: 1, fx: 1, slow: 0, goal: 30, th: 'auto', lang: 'ar' };
}

const USERS_KEY = 'lg_u';
const CUR_KEY = 'lg_cur';

interface ProgressContextValue {
  state: ProgressState;
  username: string;
  setState: (updater: (prev: ProgressState) => ProgressState) => void;
  save: () => void;
  login: (name: string) => void;
  logout: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setRawState] = useState<ProgressState>(defaultState);
  const [username, setUsername] = useState('');
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load current user on mount
  useEffect(() => {
    try {
      const cur = localStorage.getItem(CUR_KEY) || '';
      if (cur) {
        const saved = JSON.parse(localStorage.getItem('lg_s_' + cur) || '{}');
        const merged = { ...defaultState(), ...saved };
        merged.settings = { ...defaultSettings(), ...saved.settings };
        setRawState(merged);
        setUsername(cur);
      }
    } catch {
      // ignore
    }
  }, []);

  const save = () => {
    try {
      if (username) localStorage.setItem('lg_s_' + username, JSON.stringify(stateRef.current));
    } catch {
      // ignore
    }
  };

  const setState = (updater: (prev: ProgressState) => ProgressState) => {
    setRawState((prev) => {
      const next = updater(prev);
      try {
        if (username) localStorage.setItem('lg_s_' + username, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const login = (name: string) => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      users[name] = users[name] || btoa(encodeURIComponent(''));
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CUR_KEY, name);
      const saved = JSON.parse(localStorage.getItem('lg_s_' + name) || '{}');
      const merged = { ...defaultState(), ...saved };
      merged.settings = { ...defaultSettings(), ...saved.settings };
      setRawState(merged);
      setUsername(name);
    } catch {
      setRawState(defaultState());
      setUsername(name);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(CUR_KEY);
    } catch {
      // ignore
    }
    setRawState(defaultState());
    setUsername('');
  };

  return (
    <ProgressContext.Provider value={{ state, username, setState, save, login, logout }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}

export { AVATARS };
