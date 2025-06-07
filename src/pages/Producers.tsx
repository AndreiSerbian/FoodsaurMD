
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useProducersByCategory } from '../hooks/useProducersWithProducts';
import { useCategoryBySlug } from '../hooks/useCategories';
import ProducersList from '../components/ProducersList';

const Producers = () => {
  const { t } = useTranslation();
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const decodedCategorySlug = categorySlug ? decodeURIComponent(categorySlug) : '';
  
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(decodedCategorySlug);
  const { data: producers = [], isLoading: producersLoading, error } = useProducersByCategory(decodedCategorySlug);

  const loading = categoryLoading || producersLoading;

  // Function to get translated category name
  const getCategoryName = (categorySlug: string) => {
    const translationKey = `categories.${categorySlug}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : category?.name || categorySlug;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{t('categories.notFound')}</h2>
        <p className="text-gray-600 mb-8">{t('categories.notFoundMessage')}</p>
        <Link 
          to="/" 
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-300"
        >
          {t('common.back')}
        </Link>
      </div>
    );
  }

  if (producers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{t('producers.notFound')}</h2>
        <p className="text-gray-600 mb-8">{t('producers.notFoundMessage')}</p>
        <Link 
          to="/" 
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-300"
        >
          {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="mb-8"
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-primary transition duration-200"
          >
            <ArrowLeft size={20} className="mr-1" />
            {t('categories.backToCategories')}
          </Link>
        </motion.div>
        
        <ProducersList producers={producers} categoryName={getCategoryName(decodedCategorySlug)} />
      </div>
    </div>
  );
};

export default Producers;
