
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import type { ProducerWithProducts } from '../hooks/useProducersWithProducts';

interface ProducerCardProps {
  producer: ProducerWithProducts;
}

const ProducerCard: React.FC<ProducerCardProps> = ({ producer }) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    {
      url: producer.exterior_image_url || "/placeholder.svg",
      label: t('products.exteriorImage')
    }, 
    {
      url: producer.interior_image_url || "/placeholder.svg",
      label: t('products.interiorImage')
    }
  ];
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/placeholder.svg";
  };
  
  return (
    <Link to={`/producer/${encodeURIComponent(producer.producer_name)}`} className="block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative">
          <div className="w-full h-48 relative overflow-hidden">
            <img 
              src={images[currentImageIndex].url} 
              alt={`${producer.producer_name} - ${images[currentImageIndex].label}`} 
              className="w-full h-full object-cover transition-transform duration-300" 
              onError={handleImageError} 
            />
            
            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
              {images[currentImageIndex].label}
            </div>
            
            <button 
              onClick={handlePrevImage} 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-1.5 backdrop-blur-sm transition-colors" 
              aria-label={t('common.back')}
            >
              <ChevronLeft size={20} />
            </button>
            
            <button 
              onClick={handleNextImage} 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-1.5 backdrop-blur-sm transition-colors" 
              aria-label="Следующее фото"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold mb-2">{producer.producer_name}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin size={16} className="mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{producer.address}</span>
          </div>
          
          <div className="mt-auto flex flex-col gap-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{producer.products.length}</span> {t('producers.menuItems')}
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-1" />
              <span>{t('producers.discountsAvailable')} {producer.discount_available_time || t('producers.clarifyTime')}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

interface ProducersListProps {
  producers: ProducerWithProducts[];
  categoryName: string;
}

const ProducersList: React.FC<ProducersListProps> = ({ producers, categoryName }) => {
  const { t } = useTranslation();
  
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
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-2 text-center text-green-900">{categoryName}</h2>
          <p className="text-green-600 text-center mb-8">{t('producers.subtitle')}</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
          variants={container} 
          initial="hidden" 
          animate="show"
        >
          {producers.map((producer, index) => (
            <motion.div 
              key={producer.id} 
              variants={item} 
              className="producer-card h-full"
            >
              <ProducerCard producer={producer} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProducersList;
