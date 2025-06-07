
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProducerByName } from '../hooks/useProducersWithProducts';
import { getProducerImages } from '../utils/supabaseImageUtils';
import { Phone, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const ProducerDetail: React.FC = () => {
  const { producerSlug } = useParams<{ producerSlug: string }>();
  const { t } = useTranslation();

  // Преобразуем slug обратно в имя производителя
  const producerName = producerSlug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || '';

  const { data: producer, isLoading, error } = useProducerByName(producerName, false);
  const [producerImages, setProducerImages] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (producer?.producer_name) {
      getProducerImages(producer.producer_name).then(setProducerImages);
    }
  }, [producer?.producer_name]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !producer) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {producerImages.length > 0 && producerImages[0]?.url !== "/placeholder.svg" ? (
          <img
            src={producerImages[0].url}
            alt={producer.producer_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              {producer.producer_name}
            </h1>
            {producer.category && (
              <Badge className="bg-green-600 text-white">
                {producer.category.name}
              </Badge>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>О производителе</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {producer.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{producer.address}</span>
                    </div>
                  )}
                  {producer.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-5 w-5 mr-2" />
                      <span>{producer.phone}</span>
                    </div>
                  )}
                  {producer.discount_available_time && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>{producer.discount_available_time}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Products */}
              {producer.products && producer.products.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Товары</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {producer.products.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-48 object-cover rounded-md mb-3"
                            />
                          )}
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          {product.description && (
                            <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {product.price_discount ? (
                                <>
                                  <span className="text-lg font-bold text-green-600">
                                    {product.price_discount} лей
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    {product.price_regular} лей
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-gray-900">
                                  {product.price_regular} лей
                                </span>
                              )}
                            </div>
                            {product.quantity > 0 ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                В наличии
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                Нет в наличии
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Gallery */}
              {producerImages.length > 1 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Фотогалерея</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {producerImages.slice(1).map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={image.label}
                          className="w-full h-48 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerDetail;
