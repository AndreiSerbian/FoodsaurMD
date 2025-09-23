
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const HeroSection = ({
  onSearch
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = e => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };
  
  return <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background to-muted rounded-3xl"></div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <motion.div className="max-w-3xl mx-auto text-center" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }}>
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-5xl md:text-6xl font-bold mb-2 text-foreground">
            Foodsaur
          </motion.h1>
          
          <motion.p className="text-xl md:text-2xl text-muted-foreground mb-8" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }}>
            {t('heroSlogan')}
          </motion.p>
          
          <motion.form onSubmit={handleSearch} className="relative max-w-md mx-auto" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.6
        }}>
            <input type="text" placeholder={t('searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full px-6 py-4 pr-12 text-foreground bg-card rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-ring transition-shadow duration-300" />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </motion.form>
        </motion.div>
      </div>
    </div>;
};

export default HeroSection;
