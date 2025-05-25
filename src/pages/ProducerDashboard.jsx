
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useProducerProfile } from '../hooks/useProducerProfile';
import ProductsList from '../components/ProductsList';
import ProductManagement from '../components/ProductManagement';
import { useToast } from '../components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';

const ProducerDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('products');
  
  const { data: producerProfile, isLoading } = useProducerProfile();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login');
      } else {
        setUser(user);
      }
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);
  
  if (!user) {
    return <div className="h-screen flex justify-center items-center">
      <p className="text-gray-500">Загрузка...</p>
    </div>;
  }

  if (isLoading) {
    return <div className="h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>;
  }

  if (!producerProfile) {
    return <div className="h-screen flex flex-col justify-center items-center">
      <p className="text-gray-500">Профиль производителя не найден</p>
      <button 
        onClick={async () => {
          await supabase.auth.signOut();
          navigate('/auth/login');
        }}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Вернуться на страницу входа
      </button>
    </div>;
  }
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из системы.",
    });
    navigate('/auth/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={producerProfile.logo_url || "/placeholder.svg"} 
                    alt={producerProfile.producer_name} 
                  />
                  <AvatarFallback>{producerProfile.producer_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="text-xl font-bold text-green-600">{producerProfile.producer_name}</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'products' ? 'border-green-500 text-gray-900' : ''}`}
                >
                  {t('products')}
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
                {t('logout')}
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
            <ProductsList producer={producerProfile} />
          </div>
        ) : (
          <ProductManagement producer={producerProfile} />
        )}
      </motion.main>
    </div>
  );
};

export default ProducerDashboard;
