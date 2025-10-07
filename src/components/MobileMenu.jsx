
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { t, currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  // Блокировка прокрутки при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Очистка при размонтировании компонента
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Закрытие меню при изменении размера экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeMenu();
    }
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    closeMenu();
  };

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
  };

  return (
    <>
      {/* Кнопка бургер-меню */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 text-green-600 hover:text-green-900 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md"
        aria-label="Открыть меню"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Модальное меню */}
      {isOpen && (
        <div
          className="fixed inset-0 z-mobile-menu bg-black/40 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          {/* Контейнер меню */}
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-white shadow-xl transform transition-transform duration-300 ease-in-out animate-in slide-in-from-top-full overflow-y-auto">
            {/* Хедер меню */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link 
                to="/" 
                className="text-2xl font-bold text-green-900"
                onClick={closeMenu}
              >
                Foodsaur
              </Link>
              <button
                onClick={closeMenu}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md"
                aria-label="Закрыть меню"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Контент меню */}
            <div className="p-4 space-y-4">
              {/* Главная */}
              <Link
                to="/"
                className="block py-3 px-4 text-lg text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                {t('home')}
              </Link>

              {/* Секция авторизации */}
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="block py-3 px-4 text-lg text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                    onClick={closeMenu}
                  >
                    {t('producerPanel')}
                  </Link>
                  <div className="px-4 py-2 text-sm text-gray-600 border-l-4 border-green-200 bg-green-50 rounded-r-lg">
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left py-3 px-4 text-lg text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block py-3 px-4 text-lg text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                    onClick={closeMenu}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="block py-3 px-4 text-lg text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    onClick={closeMenu}
                  >
                    {t('register')}
                  </Link>
                </div>
              )}

              {/* Селектор языка */}
              <div className="pt-4 border-t border-gray-200">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 mb-2">
                  {t('languageSelector')}
                </div>
                <div className="space-y-2">
                  {availableLanguages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full flex items-center py-3 px-4 text-left rounded-lg transition-colors ${
                        currentLanguage === language.code
                          ? 'bg-green-100 text-green-900 border-2 border-green-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-3 text-lg">{language.flag}</span>
                      <span className="text-lg">{language.name}</span>
                      {currentLanguage === language.code && (
                        <span className="ml-auto text-green-600 text-sm font-medium">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
