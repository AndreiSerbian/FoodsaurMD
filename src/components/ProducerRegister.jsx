
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const ProducerRegister = () => {
  const [formData, setFormData] = useState({
    producerName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.producerName) {
      toast({
        title: "Ошибка",
        description: t('nameRequired'),
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.email) {
      toast({
        title: "Ошибка",
        description: t('emailRequired'),
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.password) {
      toast({
        title: "Ошибка",
        description: t('passwordRequired'),
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Ошибка",
        description: t('passwordsNotMatch'),
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            producer_name: formData.producerName,
            phone: formData.phone,
            address: formData.address
          }
        }
      });

      if (authError) {
        toast({
          title: "Ошибка регистрации",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Create producer profile
        const { error: profileError } = await supabase
          .from('producer_profiles')
          .insert({
            user_id: authData.user.id,
            producer_name: formData.producerName,
            phone: formData.phone,
            address: formData.address,
            email_verified: false
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        toast({
          title: "Регистрация успешна",
          description: t('registerSuccess'),
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при регистрации.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="producerName" className="block text-sm font-medium text-gray-700">
            {t('producerName')}
          </label>
          <input
            id="producerName"
            name="producerName"
            type="text"
            required
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder={t('enterName')}
            value={formData.producerName}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {t('phone')}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder={t('enterPhone')}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder={t('enterEmail')}
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            {t('address')}
          </label>
          <input
            id="address"
            name="address"
            type="text"
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder={t('enterAddress')}
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {t('password')}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder={t('enterPassword')}
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            {t('confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder={t('confirmPassword')}
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Регистрация...' : t('register')}
        </button>
      </div>
    </form>
  );
};

export default ProducerRegister;
