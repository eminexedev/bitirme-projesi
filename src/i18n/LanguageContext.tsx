import React, { useState } from 'react';
import type { Language } from './translations.ts';
import { translations } from './translations.ts';
import { LanguageContext } from './useLanguage.ts';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('appLanguage');
    if (saved === 'en' || saved === 'tr') {
      return saved;
    }

    return navigator.language.startsWith('tr') ? 'tr' : 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
