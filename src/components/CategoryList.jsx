
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { producersData } from '../data/products';

const CategoryList = ({
  categories
}) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredProducer, setHoveredProducer] = useState(null);
  
  // Анимационные варианты
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  
  const handleMouseEnter = (category, producer) => {
    setHoveredCategory(category);
    setHoveredProducer(producer);
  };
  
  const handleMouseLeave = () => {
    setHoveredCategory(null);
    setHoveredProducer(null);
  };

  // Функция для получения изображения категории
  const getCategoryImage = (category) => {
    try {
      // По умолчанию используем изображение категории
      const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
      
      // Если навели на категорию и есть конкретный производитель, показываем его интерьер
      if (hoveredCategory === category && hoveredProducer) {
        const producer = producersData.find(p => 
          p.categoryName === category && p.producerName === hoveredProducer
        );
        
        if (producer && producer.producerImage.interior) {
          const normalizedProducer = producer.producerName.toLowerCase().replace(/\s+/g, '-');
          return `/assets/images/producers/${normalizedCategory}/${normalizedProducer}-interior.jpg`;
        }
      }
      
      // Иначе возвращаем общее изображение категории
      return `/assets/images/categories/${normalizedCategory}.jpg`;
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      return "/placeholder.svg";
    }
  };

  // Получить список уникальных производителей для каждой категории
  const getProducersForCategory = (category) => {
    return producersData
      .filter(p => p.categoryName === category)
      .map(p => p.producerName);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-green-900">Категории</h2>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" 
          variants={container} 
          initial="hidden" 
          animate="show"
        >
          {categories.map((category, index) => (
            <motion.div 
              key={index} 
              variants={item} 
              className="category-card relative overflow-hidden"
            >
              <Link to={`/category/${encodeURIComponent(category)}`} className="block">
                <div 
                  className="aspect-w-16 aspect-h-9 relative" 
                  onMouseLeave={handleMouseLeave}
                >
                  <img 
                    src={getCategoryImage(category)} 
                    alt={category} 
                    className="w-full h-64 object-cover transition-transform duration-500"
                    onError={(e) => {e.target.src = "/placeholder.svg"}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <h3 className="text-white text-xl font-semibold p-4">{category}</h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryList;
