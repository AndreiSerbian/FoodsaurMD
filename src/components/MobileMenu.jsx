
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, LogIn, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetDescription,
} from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const MobileMenu = () => {
  const { user, userRole, signOut } = useAuth();
  const { t, currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'ru' ? 'ro' : 'ru';
    changeLanguage(newLanguage);
    setIsSheetOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setIsSheetOpen(false);
  };

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  const menuItems = [
    {
      icon: Home,
      label: t('home'),
      to: '/',
    },
  ];

  if (user) {
    menuItems.push({
      icon: Settings,
      label: t('producerPanel'),
      to: '/dashboard',
    });
    
    if (userRole === 'admin') {
      menuItems.push({
        icon: User,
        label: t('adminPanel'),
        to: '/admin-panel',
      });
    }
  }

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t('openMenu')}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              {t('menu')}
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </SheetTitle>
            <SheetDescription>
              {t('menu')} навигации приложения
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                onClick={() => setIsSheetOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">{item.label}</span>
              </Link>
            ))}
            
            <div className="border-t pt-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
              >
                <span className="text-lg">{currentLang?.flag}</span>
                <span className="text-gray-700">
                  {currentLanguage === 'ru' ? 'Română' : 'Русский'}
                </span>
              </button>
            </div>

            <div className="border-t pt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-red-600"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsSheetOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogIn className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">{t('login')} / {t('register')}</span>
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t('openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {menuItems.map((item, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link to={item.to} className="flex items-center space-x-2">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={toggleLanguage}>
          <span className="mr-2">{currentLang?.flag}</span>
          <span>{currentLanguage === 'ru' ? 'Română' : 'Русский'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {user ? (
          <>
            <div className="px-2 py-1.5 text-sm text-gray-600">
              {user.email}
            </div>
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogIn className="h-4 w-4 mr-2" />
              {t('logout')}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/login" className="flex items-center space-x-2">
              <LogIn className="h-4 w-4" />
              <span>{t('login')} / {t('register')}</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileMenu;
