
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import LanguageSelector from './LanguageSelector';
import Cart from './Cart';

const Layout = ({ children }) => {
  const { user, userRole, signOut } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-900">Foodsaur</Link>
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-green-600 hover:text-green-900 transition duration-200">
              {t('home')}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="text-green-600 hover:text-green-900 transition duration-200"
                >
                  {t('producerPanel')}
                </Link>
                {userRole === 'admin' && (
                  <Link 
                    to="/admin-panel" 
                    className="text-red-600 hover:text-red-900 transition duration-200"
                  >
                    {t('adminPanel')}
                  </Link>
                )}
                <span className="text-gray-600 text-sm">{user.email}</span>
                <Button 
                  onClick={signOut} 
                  variant="outline" 
                  size="sm"
                >
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
            
            <LanguageSelector />
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-green-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Foodsaur. {t('rightsReserved')}</p>
            <p className="mt-2">{t('footerSlogan1')} • {t('footerSlogan2')} • {t('footerSlogan3')}</p>
          </div>
        </div>
      </footer>
      
      <Cart />
    </div>
  );
};

export default Layout;
