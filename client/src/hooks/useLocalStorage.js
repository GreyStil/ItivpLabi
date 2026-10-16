import { useEffect, useState } from 'react';


export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setValue(JSON.parse(raw));
      }
    } catch {
      setValue(initialValue);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, isHydrated]);

  return [value, setValue, isHydrated];
}