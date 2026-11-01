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
  login: (name: string, password?: string) => void;
  logout: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function dailyReset(s: ProgressState): ProgressState {
  const t = new Date().toDateString();
  if (s.dd !== t) {
    return { ...s, dd: t, dxp: 0, ls: 0, pf: 0, cl: [] };
  }
  return s;
}

function regenHearts(s: ProgressState): ProgressState {
  if (s.lock && Date.now() >= s.lock) {
    return { ...s, hearts: 5, lock: 0, ht: 0 };
  }
  if (s.hearts < 5 && !s.lock) {
    const now = Date.now();
    const elapsed = now - (s.ht || now);
    if (elapsed >= 300000) {
      const gained = Math.floor(elapsed / 300000);
      const hearts = Math.min(5, s.hearts + gained);
      const ht = hearts < 5 ? now : 0;
      return { ...s, hearts, ht };
    }
  }
  if (s.hearts >= 5) {
    if (s.ht !== 0) return { ...s, ht: 0 };
  }
  return s;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setRawState] = useState<ProgressState>(defaultState);
  const [username, setUsername] = useState('');
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const cur = localStorage.getItem(CUR_KEY) || '';
      if (cur) {
        const saved = JSON.parse(localStorage.getItem('lg_s_' + cur) || '{}');
        const merged = { ...defaultState(), ...saved };
        merged.settings = { ...defaultSettings(), ...saved.settings };
        const reset = dailyReset(merged);
        const regen = regenHearts(reset);
        setRawState(regen);
        setUsername(cur);
      }
    } catch {
      // ignore
    }
  }, []);

  // Heart regen interval
  useEffect(() => {
    const interval = setInterval(() => {
      setRawState((prev) => {
        const regen = regenHearts(prev);
        if (regen !== prev) {
          try {
            if (username) localStorage.setItem('lg_s_' + username, JSON.stringify(regen));
          } catch {
            // ignore
          }
          return regen;
        }
        return prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [username]);

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

  const login = (name: string, password?: string) => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      const pwHash = btoa(encodeURIComponent(password || ''));
      if (password !== undefined && password !== '') {
        if (users[name] !== undefined && users[name] !== pwHash) {
          toastMsg('كلمة المرور غير صحيحة');
          return;
        }
        users[name] = pwHash;
      } else {
        users[name] = users[name] || pwHash;
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CUR_KEY, name);
      const saved = JSON.parse(localStorage.getItem('lg_s_' + name) || '{}');
      const merged = { ...defaultState(), ...saved };
      merged.settings = { ...defaultSettings(), ...saved.settings };
      const reset = dailyReset(merged);
      const regen = regenHearts(reset);
      setRawState(regen);
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

function toastMsg(msg: string) {
  window.dispatchEvent(new CustomEvent('lg-toast', { detail: msg }));
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}

export { AVATARS };
