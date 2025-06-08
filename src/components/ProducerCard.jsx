
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock } from 'lucide-react';
import ImageSlider from './ImageSlider';

const ProducerCard = ({ producer }) => {
  const { t } = useTranslation();
  
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
  
  return (
    <Link to={`/producer/${encodeURIComponent(producer.producer_name)}`} className="block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        <ImageSlider images={images} alt={producer.producer_name} />
        
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold mb-2">{producer.producer_name}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin size={16} className="mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{producer.address}</span>
          </div>
          
          <div className="mt-auto flex flex-col gap-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{producer.products?.length || 0}</span> {t('producers.menuItems')}
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

export default ProducerCard;
