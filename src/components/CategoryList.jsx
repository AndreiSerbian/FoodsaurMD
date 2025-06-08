
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CategoryList = () => {
  const { t } = useTranslation();

  // Моковые категории для демонстрации
  const categories = [
    {
      id: 1,
      name: 'Десерты',
      slug: 'desserts',
      imageUrl: '/placeholder.svg',
      count: 5
    },
    {
      id: 2,
      name: 'Молдавская кухня',
      slug: 'moldavian',
      imageUrl: '/placeholder.svg',
      count: 3
    },
    {
      id: 3,
      name: 'Европейская кухня',
      slug: 'european',
      imageUrl: '/placeholder.svg',
      count: 4
    },
    {
      id: 4,
      name: 'Напитки',
      slug: 'drinks',
      imageUrl: '/placeholder.svg',
      count: 2
    }
  ];

  return (
    <motion.section 
      className="py-16"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-green-900">{t('categories.title')}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('categories.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <Link to={`/category/${category.slug}`} className="block">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <div className="relative overflow-hidden">
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {e.currentTarget.src = "/placeholder.svg"}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-sm font-medium">{category.count} производителей</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-green-900 group-hover:text-green-700 transition-colors duration-200">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default CategoryList;
