import { useState } from 'react';
import { useProgress } from '@/state/ProgressContext';
import { toast } from '@/utils/toast';

export default function Login() {
  const { login } = useProgress();
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');

  const handleLogin = (guest?: boolean) => {
    const n = guest ? 'ضيف' : name.trim();
    if (!n) {
      toast('اكتب اسم المستخدم');
      return;
    }
    login(n, guest ? '' : pw);
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
      <input
        className="inp"
        type="password"
        placeholder="كلمة المرور (اختيارية)"
        style={{ textAlign: 'center' }}
        value={pw}
        onChange={(e) => setPw(e.target.value)}
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
