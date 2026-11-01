import { useState } from 'react';
import { useProgress } from '@/state/ProgressContext';

export default function Login() {
  const { login } = useProgress();
  const [name, setName] = useState('');

  const handleLogin = (guest?: boolean) => {
    const n = guest ? 'ضيف' : name.trim();
    if (!n) return;
    login(n);
  };

  return (
    <div className="login">
      <div className="mascot" style={{ fontSize: 90 }}>
        🦉
      </div>
      <h1>لينجو</h1>
      <p>تعلّم الإنجليزية بالمرح</p>
      <input
        className="inp"
        placeholder="اسم المستخدم"
        style={{ textAlign: 'center' }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className="btn" style={{ marginTop: 16 }} onClick={() => handleLogin()}>
        دخول / إنشاء حساب
      </button>
      <button className="lnk" onClick={() => handleLogin(true)}>
        المتابعة كضيف
      </button>
      <small>الحسابات محفوظة على جهازك فقط</small>
    </div>
  );
}
