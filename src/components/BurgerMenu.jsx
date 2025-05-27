
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMenu}
          />
          <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg z-50 py-2">
            <div className="px-4 py-3 border-b">
              <LanguageSwitcher />
            </div>
            <Link
              to="/auth/login"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              {t('login')}
            </Link>
            <Link
              to="/auth/register"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              {t('register')}
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default BurgerMenu;
