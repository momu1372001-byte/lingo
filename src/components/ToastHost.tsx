import { useEffect, useState } from 'react';
import { setToastHandler } from '@/utils/toast';

export default function ToastHost() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    setToastHandler((msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(''), 3000);
    });
  }, []);

  if (!message) return null;
  return <div className="toast">{message}</div>;
}
