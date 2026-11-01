import { useEffect, useState } from 'react';
import { setToastHandler } from '@/utils/toast';

export default function ToastHost() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    setToastHandler((msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(''), 3000);
    });

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setMessage(detail);
      setTimeout(() => setMessage(''), 3000);
    };
    window.addEventListener('lg-toast', onCustom);
    return () => window.removeEventListener('lg-toast', onCustom);
  }, []);

  if (!message) return null;
  return <div className="toast">{message}</div>;
}
