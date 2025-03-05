
import React, { useState, useEffect } from 'react';
import { producersData, categories } from '../data';
import HeroSection from '../components/HeroSection';
import CategoryList from '../components/CategoryList';
import { motion } from 'framer-motion';

const Home = () => {
  const [filteredProducers, setFilteredProducers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducers([]);
    } else {
      const filtered = producersData.filter(producer => 
        producer.producerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        producer.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducers(filtered);
    }
  }, [searchQuery]);

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
            <h2 className="text-2xl font-bold mb-6 text-center">Результаты поиска</h2>
            
            {filteredProducers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducers.map((producer, index) => (
                  <motion.div 
                    key={index}
                    className="producer-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <a href={`/producer/${encodeURIComponent(producer.producerName)}`} className="block">
                      <div className="relative">
                        <img 
                          src={producer.producerImage.exterior || "/placeholder.svg"} 
                          alt={producer.producerName}
                          className="w-full h-48 object-cover rounded-t-2xl"
                        />
                      </div>
                      <div className="p-6">
                        <div className="text-sm font-medium text-blue-500 mb-1">{producer.categoryName}</div>
                        <h3 className="text-xl font-semibold mb-2">{producer.producerName}</h3>
                        <p className="text-gray-600 text-sm">{producer.address}</p>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">По вашему запросу ничего не найдено.</p>
            )}
          </motion.div>
        )}
        
        {/* If no search query show categories */}
        {searchQuery.trim() === '' && (
          <CategoryList categories={categories} />
        )}
      </div>
    </div>
  );
};

export default Home;
