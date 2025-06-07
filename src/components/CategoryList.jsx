
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../hooks/useCategories';
import { useProducersByCategory } from '../hooks/useProducersWithProducts';
import { getCategoryImage } from '../utils/imageUtils';
import { getProducerImagesSync } from '../utils/supabaseImageUtils';
import ProducerImageSlider from './ProducerImageSlider';

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

  // Function to get translated category name
  const getCategoryName = (categorySlug) => {
    const translationKey = `categories.${categorySlug}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : categorySlug;
  };

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
              getCategoryName={getCategoryName}
              item={item}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const CategoryCard = ({ category, getCategoryName, item }) => {
  const { data: producers = [] } = useProducersByCategory(category.slug);
  
  // Получаем первого производителя для отображения его изображений
  const firstProducer = producers[0];
  const producerImages = firstProducer 
    ? getProducerImagesSync(firstProducer.producer_name)
    : [];

  return (
    <motion.div 
      variants={item}
      className="category-card"
    >
      <Link 
        to={`/category/${category.slug}`}
        className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
      >
        <div className="relative">
          {/* Если есть производители в категории и есть их изображения - показываем слайдер */}
          {firstProducer && producerImages.length > 0 ? (
            <ProducerImageSlider images={producerImages} />
          ) : (
            /* Иначе показываем изображение категории */
            <div className="relative h-48 overflow-hidden">
              <img 
                src={getCategoryImage(category.slug)} 
                alt={getCategoryName(category.slug)}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-1">
              {getCategoryName(category.slug)}
            </h3>
            {category.description && (
              <p className="text-white/80 text-sm">
                {category.description}
              </p>
            )}
            {/* Показываем информацию о производителе, если есть */}
            {firstProducer && (
              <p className="text-white/70 text-xs mt-1">
                {firstProducer.producer_name}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryList;
