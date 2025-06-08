
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import CategoryList from '../components/CategoryList';
import { useProducersWithProducts } from '../hooks/useProducersWithProducts';

const Home = () => {
  const { t } = useTranslation();
  const [filteredProducers, setFilteredProducers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: allProducers = [] } = useProducersWithProducts();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducers([]);
    } else {
      const filtered = allProducers.filter(producer => 
        producer.producer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (producer.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducers(filtered);
    }
  }, [searchQuery, allProducers]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="pb-20">
      <div className="container mx-auto px-4 py-8">
        <HeroSection onSearch={handleSearch} />
        
        {searchQuery.trim() !== '' && (
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">{t('search.results')}</h2>
            
            {filteredProducers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducers.map((producer, index) => (
                  <motion.div 
                    key={producer.id}
                    className="producer-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`/producer/${encodeURIComponent(producer.producer_name)}`} className="block">
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <div className="relative">
                          <img 
                            src={producer.exterior_image_url || "/placeholder.svg"} 
                            alt={producer.producer_name}
                            className="w-full h-48 object-cover"
                            onError={(e) => {e.currentTarget.src = "/placeholder.svg"}}
                          />
                        </div>
                        <div className="p-6">
                          <div className="text-sm font-medium text-blue-500 mb-1">
                            {producer.category?.name || ''}
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{producer.producer_name}</h3>
                          <p className="text-gray-600 text-sm">{producer.address}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">{t('search.noResults')}</p>
                <p className="text-gray-400">{t('search.tryDifferent')}</p>
              </div>
            )}
          </motion.div>
        )}
        
        {searchQuery.trim() === '' && (
          <CategoryList />
        )}
      </div>
    </div>
  );
};

export default Home;
