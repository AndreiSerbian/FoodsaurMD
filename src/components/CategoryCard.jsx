
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducersByCategory } from '../hooks/useProducersWithProducts';
import { getProducerImagesSync } from '../utils/supabaseImageUtils';
import { getCategoryImage } from '../utils/categoryUtils';
import ProducerImageSlider from './ProducerImageSlider';

const CategoryCard = ({ category, getCategoryName, item }) => {
  const { data: producers = [], isLoading: producersLoading } = useProducersByCategory(category.slug, false);
  
  const firstProducer = !producersLoading && producers.length > 0 ? producers[0] : null;
  const producerImages = firstProducer 
    ? getProducerImagesSync(firstProducer.producer_name)
    : [];

  const hasValidProducerImages = producerImages.length > 0 && 
    producerImages.some(img => img.url && img.url !== "/placeholder.svg");

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
          {!producersLoading && firstProducer && hasValidProducerImages ? (
            <ProducerImageSlider images={producerImages} />
          ) : (
            <div className="relative h-48 overflow-hidden">
              <img 
                src={category.image_url || getCategoryImage(category.slug)} 
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
            {!producersLoading && firstProducer && (
              <p className="text-white/70 text-xs mt-1">
                {firstProducer.producer_name}
              </p>
            )}
            {!producersLoading && producers.length > 0 && (
              <p className="text-white/60 text-xs">
                {producers.length} {producers.length === 1 ? 'производитель' : 'производителей'}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
