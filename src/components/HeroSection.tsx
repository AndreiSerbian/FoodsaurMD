
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };
  
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 rounded-3xl"></div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-2 text-green-900"
          >
            {t('hero.title')}
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-green-600 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t('hero.tagline')}
          </motion.p>

          <motion.p 
            className="text-base text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {t('hero.subtitle')}
          </motion.p>
          
          <motion.form 
            onSubmit={handleSearch} 
            className="relative max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <input 
              type="text" 
              placeholder={t('hero.searchPlaceholder')}
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full px-6 py-4 pr-12 text-green-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-200 transition-shadow duration-300" 
            />
            <button 
              type="submit" 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-900 transition-colors duration-300"
            >
              <Search size={24} />
            </button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
