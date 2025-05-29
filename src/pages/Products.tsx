
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducerByName } from '../hooks/useProducersWithProducts';
import ProductsList from '../components/ProductsList';

const Products = () => {
  const { producerName } = useParams<{ producerName: string }>();
  const decodedProducerName = producerName ? decodeURIComponent(producerName) : '';
  
  const { data: producer, isLoading, error } = useProducerByName(decodedProducerName);
  const [currentImage, setCurrentImage] = useState(0);
  
  // Безопасно получаем изображения
  const images = producer ? [
    { url: producer.exterior_image_url || "/placeholder.svg", label: 'Экстерьер' },
    { url: producer.interior_image_url || "/placeholder.svg", label: 'Интерьер' }
  ] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !producer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Ресторан не найден</h2>
        <p className="text-gray-600 mb-8">К сожалению, такого ресторана нет в нашей базе.</p>
        <Link to="/" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300">
          Вернуться на главную
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
            to={producer.category ? `/category/${producer.category.slug}` : '/'} 
            className="inline-flex items-center text-green-600 hover:text-green-700 transition duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к ресторанам
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.2 }} 
          className="mb-8 relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden"
        >
          <img 
            src={images[currentImage]?.url || "/placeholder.svg"} 
            alt={`${producer.producer_name} - ${images[currentImage]?.label}`} 
            className="w-full h-full object-cover"
            onError={(e) => {e.currentTarget.src = "/placeholder.svg"}}
          />
          
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
            {images[currentImage]?.label || 'Изображение'}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <div className="p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">{producer.producer_name}</h1>
              <p className="opacity-90">{producer.address}</p>
            </div>
          </div>
        </motion.div>
        
        <ProductsList producer={producer} />
      </div>
    </div>
  );
};

export default Products;
