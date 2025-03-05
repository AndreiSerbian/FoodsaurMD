
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const ProducerCard = ({
  producer
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    {
      url: producer.producerImage.exterior,
      label: 'Экстерьер'
    }, 
    {
      url: producer.producerImage.interior,
      label: 'Интерьер'
    }
  ];
  
  const handleNextImage = e => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };
  
  const handlePrevImage = e => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };
  
  return (
    <Link to={`/producer/${encodeURIComponent(producer.producerName)}`} className="block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative">
          <div className="w-full h-48 relative overflow-hidden">
            <img 
              src={images[currentImageIndex].url} 
              alt={`${producer.producerName} - ${images[currentImageIndex].label}`} 
              className="w-full h-full object-cover transition-transform duration-300" 
              onError={(e) => {e.target.src = "/placeholder.svg"}} 
            />
            
            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
              {images[currentImageIndex].label}
            </div>
            
            <button 
              onClick={handlePrevImage} 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-1.5 backdrop-blur-sm transition-colors" 
              aria-label="Предыдущее фото"
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
          <h3 className="text-xl font-semibold mb-2">{producer.producerName}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin size={16} className="mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{producer.address}</span>
          </div>
          
          <div className="mt-auto flex flex-col gap-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{producer.products.length}</span> позиций в меню
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Скидки доступны {producer.discountAvailableTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ProducersList = ({
  producers,
  categoryName
}) => {
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
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center text-green-900">{categoryName}</h2>
        <p className="text-green-600 text-center mb-8">Выберите ресторан с уцененными товарами</p>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
          variants={container} 
          initial="hidden" 
          animate="show"
        >
          {producers.map((producer, index) => (
            <motion.div 
              key={index} 
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
