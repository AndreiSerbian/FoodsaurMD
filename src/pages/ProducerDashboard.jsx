
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProducerAuth } from '../contexts/ProducerAuthContext';
import { getProducerByName } from '../data/products';
import ProductsList from '../components/ProductsList';
import ProductManagement from '../components/ProductManagement';
import { useToast } from '../components/ui/use-toast';

const ProducerDashboard = () => {
  const { currentProducer, logout } = useProducerAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('products');
  
  // Перенаправление на страницу входа, если не авторизован
  React.useEffect(() => {
    if (!currentProducer) {
      navigate('/producer/login');
    }
  }, [currentProducer, navigate]);
  
  if (!currentProducer) {
    return <div className="h-screen flex justify-center items-center">
      <p className="text-gray-500">Загрузка...</p>
    </div>;
  }
  
  const producer = getProducerByName(currentProducer.producerName);
  
  if (!producer) {
    return <div className="h-screen flex flex-col justify-center items-center">
      <p className="text-gray-500">Производитель не найден</p>
      <button 
        onClick={() => {
          logout();
          navigate('/producer/login');
        }}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Вернуться на страницу входа
      </button>
    </div>;
  }
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из системы.",
    });
    navigate('/producer/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-green-600">{producer.producerName}</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'products' ? 'border-green-500 text-gray-900' : ''}`}
                >
                  Товары
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'manage' ? 'border-green-500 text-gray-900' : ''}`}
                >
                  Управление товарами
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <motion.main 
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {activeTab === 'products' ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Ваши товары</h2>
            <ProductsList products={producer.products} producer={producer} />
          </div>
        ) : (
          <ProductManagement producer={producer} />
        )}
      </motion.main>
    </div>
  );
};

export default ProducerDashboard;
