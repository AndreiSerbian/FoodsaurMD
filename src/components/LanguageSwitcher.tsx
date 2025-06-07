
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <motion.div 
      className="flex items-center space-x-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Globe size={16} className="text-green-600" />
      <div className="flex space-x-1">
        <motion.button
          onClick={() => changeLanguage('ru')}
          className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
            i18n.language === 'ru' 
              ? 'bg-green-600 text-white shadow-sm' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={t('language.ru')}
        >
          РУ
        </motion.button>
        <motion.button
          onClick={() => changeLanguage('ro')}
          className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
            i18n.language === 'ro' 
              ? 'bg-green-600 text-white shadow-sm' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={t('language.ro')}
        >
          RO
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LanguageSwitcher;
