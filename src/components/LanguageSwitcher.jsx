
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => changeLanguage('ru')}
        className={`px-3 py-1 rounded text-sm ${
          i18n.language === 'ru' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        РУ
      </button>
      <button
        onClick={() => changeLanguage('ro')}
        className={`px-3 py-1 rounded text-sm ${
          i18n.language === 'ro' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        RO
      </button>
    </div>
  );
};

export default LanguageSwitcher;
