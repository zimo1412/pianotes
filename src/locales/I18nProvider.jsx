/**
 * i18n provider: zh/en packs, `t()` interpolation, persisted locale, document.title + html[lang].
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { practiceStorage } from '../storage.js';
import zh from './zh.js';
import en from './en.js';

const MESSAGES = { zh, en };

function getPath(obj, path) {
  const parts = String(path).split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function interpolate(str, vars) {
  if (str == null || typeof str !== 'string') return str;
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

const I18nContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState('zh');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await practiceStorage.get('locale');
        const v = r?.value;
        if (!cancelled && (v === 'zh' || v === 'en')) setLocaleState(v);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback(async (next) => {
    const L = next === 'en' ? 'en' : 'zh';
    setLocaleState(L);
    try {
      await practiceStorage.set('locale', L);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
  }, [locale]);

  useEffect(() => {
    const pack = MESSAGES[locale] ?? MESSAGES.zh;
    const title = getPath(pack, 'meta.documentTitle');
    if (typeof title === 'string' && title.trim()) document.title = title.trim();
  }, [locale]);

  const messages = MESSAGES[locale] ?? MESSAGES.zh;

  const t = useCallback(
    (key, vars) => {
      const raw = getPath(messages, key);
      if (typeof raw !== 'string') return key;
      return interpolate(raw, vars);
    },
    [messages],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, messages }),
    [locale, setLocale, t, messages],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside LocaleProvider');
  return ctx;
}
