
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import ProducerLogin from '../components/ProducerLogin';
import ProducerRegister from '../components/ProducerRegister';

const ProducerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/producer/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? t('login') : t('register')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? (
              <>
                Нет аккаунта?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  {t('register')}
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  {t('login')}
                </button>
              </>
            )}
          </p>
        </div>

        {isLogin ? <ProducerLogin /> : <ProducerRegister />}
      </motion.div>
    </div>
  );
};

export default ProducerAuth;
