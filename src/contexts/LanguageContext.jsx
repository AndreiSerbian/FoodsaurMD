
import React, { createContext, useContext, useState, useEffect } from 'react';

// Импортируем переводы
import ruTranslations from '../lang/ru.json';
import roTranslations from '../lang/ro.json';

const translations = {
  ru: ruTranslations,
  ro: roTranslations
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('ru');

  useEffect(() => {
    // Загружаем сохраненный язык из localStorage при инициализации
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      localStorage.setItem('selectedLanguage', language);
    }
  };

  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
      { code: 'ro', name: 'Română', flag: '🇷🇴' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
