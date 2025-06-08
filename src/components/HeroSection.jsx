
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <motion.section 
      className="text-center py-20 bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl mb-16"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-800 to-blue-600 bg-clip-text text-transparent">
          {t('hero.title')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
