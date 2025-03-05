
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducerByName } from '../data/products';
import ProductsList from '../components/ProductsList';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

const Products = () => {
  const { producerName } = useParams();
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const decodedProducerName = decodeURIComponent(producerName);
      const foundProducer = getProducerByName(decodedProducerName);
      setProducer(foundProducer);
      setLoading(false);
    }, 500);
  }, [producerName]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>;
  }

  if (!producer) {
    return <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Ресторан не найден</h2>
        <p className="text-gray-600 mb-8">К сожалению, такого ресторана нет в нашей базе.</p>
        <Link to="/" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-300">
          Вернуться на главную
        </Link>
      </div>;
  }

  const images = [
    { url: producer.producerImage.exterior, label: 'Экстерьер' },
    { url: producer.producerImage.interior, label: 'Интерьер' }
  ];

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} className="mb-8">
          <Link to={`/category/${encodeURIComponent(producer.categoryName)}`} className="inline-flex items-center text-green-600 hover:text-primary transition duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к ресторанам
          </Link>
        </motion.div>
        
        <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="mb-8 relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden">
          <img 
            src={images[currentImage].url || "/placeholder.svg"} 
            alt={`${producer.producerName} - ${images[currentImage].label}`} 
            className="w-full h-full object-cover"
            onError={(e) => {e.target.src = "/placeholder.svg"}}
          />
          
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
            {images[currentImage].label}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <div className="p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">{producer.producerName}</h1>
              <p className="opacity-90">{producer.address}</p>
            </div>
          </div>
        </motion.div>
        
        <ProductsList products={producer.products} producer={producer} />
      </div>
    </div>;
};

export default Products;
