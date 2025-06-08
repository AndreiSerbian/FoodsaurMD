
import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { producersData } from '../data/products';
import ProducerMap from '../components/ProducerMap';

const ProducerDetail = () => {
  const { producerSlug } = useParams();
  const { t } = useTranslation();
  
  const producer = producersData.find(p => p.producerSlug === producerSlug);

  if (!producer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Производитель не найден</h1>
          <p className="text-gray-600">Запрашиваемый производитель не существует.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{producer.producerName}</h1>
            <p className="text-gray-600 mb-2"><strong>Категория:</strong> {producer.category}</p>
            <p className="text-gray-600 mb-2"><strong>Адрес:</strong> {producer.address}</p>
            <p className="text-gray-600 mb-2"><strong>Телефон:</strong> {producer.phone}</p>
            <p className="text-gray-600 mb-4"><strong>Время скидок:</strong> {producer.discountAvailableTime}</p>
          </div>

          <ProducerMap producer={producer} />

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Продукция</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {producer.products.map((product) => (
                <div key={product.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <img 
                    src={product.image} 
                    alt={product.productName}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {e.currentTarget.src = "/placeholder.svg"}}
                  />
                  <h3 className="text-lg font-semibold mb-2">{product.productName}</h3>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">{product.priceDiscount} лей</span>
                      <span className="text-sm text-gray-500 line-through">{product.priceRegular} лей</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Доступно: {product.quantity} шт.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProducerDetail;
