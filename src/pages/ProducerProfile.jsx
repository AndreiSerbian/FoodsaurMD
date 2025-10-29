import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../integrations/supabase/client';

const ProducerProfile = () => {
  const { producerSlug } = useParams();
  const navigate = useNavigate();
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [pointsCount, setPointsCount] = useState(0);

  useEffect(() => {
    fetchProducerData();
  }, [producerSlug]);

  const fetchProducerData = async () => {
    try {
      // Получаем данные производителя
      const { data: producerData, error: producerError } = await supabase
        .from('producer_profiles')
        .select(`
          *,
          producer_categories(
            categories(name)
          )
        `)
        .eq('slug', producerSlug)
        .single();

      if (producerError || !producerData) {
        setProducer(null);
        setLoading(false);
        return;
      }

      // Получаем количество активных точек
      const { count } = await supabase
        .from('pickup_points')
        .select('*', { count: 'exact', head: true })
        .eq('producer_id', producerData.id)
        .eq('is_active', true);

      setPointsCount(count || 0);

      const formattedProducer = {
        id: producerData.id,
        slug: producerData.slug,
        producerName: producerData.producer_name,
        address: producerData.address || 'Адрес не указан',
        discountAvailableTime: producerData.discount_available_time || 'Скидки не доступны',
        categoryName: producerData.producer_categories?.[0]?.categories?.name || 'Без категории',
        producerImage: {
          exterior: (producerData.exterior_image_url && producerData.exterior_image_url !== 'null') ? producerData.exterior_image_url : '/placeholder.svg',
          interior: (producerData.interior_image_url && producerData.interior_image_url !== 'null') ? producerData.interior_image_url : '/placeholder.svg'
        }
      };

      setProducer(formattedProducer);
    } catch (error) {
      console.error('Error fetching producer data:', error);
      setProducer(null);
    } finally {
      setLoading(false);
    }
  };

  const images = producer ? [
    { url: producer.producerImage.exterior, label: 'Экстерьер' },
    { url: producer.producerImage.interior, label: 'Интерьер' }
  ] : [];

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

  const handleSelectPoint = () => {
    navigate(`/producer/${producerSlug}/points`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Производитель не найден</h2>
        <p className="text-gray-600 mb-8">К сожалению, такого производителя нет в нашей базе.</p>
        <Link to="/" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-300">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Навигация назад */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            to={`/category/${encodeURIComponent(producer.categoryName)}`}
            className="inline-flex items-center text-green-600 hover:text-primary transition duration-200"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Назад к производителям
          </Link>
        </motion.div>

        {/* Изображения производителя */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden"
        >
          <img 
            src={images[currentImage]?.url || "/placeholder.svg"} 
            alt={`${producer.producerName} - ${images[currentImage]?.label}`} 
            className="w-full h-full object-cover"
            onError={(e) => {e.currentTarget.src = "/placeholder.svg"}}
          />
          
          {/* Навигация по изображениям */}
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 backdrop-blur-sm transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button 
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 backdrop-blur-sm transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
            {images[currentImage]?.label}
          </div>
          
          {/* Информация о производителе */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <div className="p-8 text-white">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-2">
                {producer.categoryName}
              </span>
              <h1 className="text-3xl font-bold mb-2">{producer.producerName}</h1>
              <div className="flex items-center opacity-90">
                <MapPin size={16} className="mr-1" />
                <span>{producer.address}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Информационная карточка */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Время скидок</h3>
                <p className="text-gray-600">{producer.discountAvailableTime}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Точек выдачи</h3>
                <p className="text-gray-600">{pointsCount} {pointsCount === 1 ? 'точка' : 'точки'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Кнопка выбора точки */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          {pointsCount > 0 ? (
            <Button 
              onClick={handleSelectPoint}
              size="lg"
              className="px-8 py-4 text-lg"
            >
              Выбрать точку выдачи ({pointsCount})
            </Button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800 font-medium">
                У данного производителя пока нет активных точек выдачи
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProducerProfile;