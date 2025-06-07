
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Cart from './Cart';
import BurgerMenu from './BurgerMenu';
import LanguageSwitcher from './LanguageSwitcher';

const Layout = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-900">
            Foodsaur
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-green-600 hover:text-green-900 transition duration-200">
              {t('navigation.home')}
            </Link>
            <Link to="/map" className="text-green-600 hover:text-green-900 transition duration-200">
              {t('navigation.map')}
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <BurgerMenu />
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <motion.div
          key={`content-${Date.now()}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-green-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Foodsaur. {t('footer.rights')}</p>
            <p className="mt-2">{t('footer.tagline')}</p>
          </div>
        </div>
      </footer>
      
      <Cart />
    </motion.div>
  );
};

export default Layout;
