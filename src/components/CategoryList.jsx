
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../hooks/useCategories';
import { getCategoryName } from '../utils/categoryUtils';
import CategoryCard from './CategoryCard';

const CategoryList = () => {
  const { t } = useTranslation();
  const { data: categories = [], isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{t('common.error')}</h2>
        <p className="text-gray-600 mb-8">{t('categories.notFoundMessage')}</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getCategoryNameWithTranslation = (categorySlug) => getCategoryName(categorySlug, t);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-2 text-center text-green-900">
            {t('categories.title')}
          </h2>
          <p className="text-green-600 text-center mb-8">
            {t('categories.subtitle')}
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category}
              getCategoryName={getCategoryNameWithTranslation}
              item={item}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryList;
