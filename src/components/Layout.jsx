import React from 'react';
import { Link } from 'react-router-dom';
import Cart from './Cart';
const Layout = ({
  children
}) => {
  return <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-900">Foodsaur</Link>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-green-600 hover:text-green-900 transition duration-200">Главная</Link>
            
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-green-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Foodsaur. Все права защищены.</p>
            <p className="mt-2">Вкусно • Выгодно • Экологично</p>
          </div>
        </div>
      </footer>
      
      <Cart />
    </div>;
};
export default Layout;