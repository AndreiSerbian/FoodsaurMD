
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import HeroSection from '../components/HeroSection';
import CategoryList from '../components/CategoryList';
import PublicPointsMap from '../components/maps/PublicPointsMap';
import { motion } from 'framer-motion';

const Home = () => {
  const [filteredProducers, setFilteredProducers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducers([]);
    } else {
      searchProducers();
    }
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');
      
      if (!error && data) {
        setCategories(data.map(cat => cat.name));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchProducers = async () => {
    try {
      const { data, error } = await supabase
        .from('producer_profiles')
        .select(`
          *,
          producer_categories(
            categories(
              name
            )
          )
        `)
        .ilike('producer_name', `%${searchQuery}%`);
      
      if (!error && data) {
        const formatted = data.map(producer => {
          // Собираем все категории производителя
          const allCategories = producer.producer_categories?.map(pc => pc.categories?.name).filter(Boolean) || [];
          const categoryString = allCategories.length > 0 ? allCategories.join(', ') : 'Без категории';
          
          return {
            producerName: producer.producer_name,
            address: producer.address,
            categoryName: categoryString,
            slug: producer.slug,
            producerImage: {
              exterior: (producer.exterior_image_url && producer.exterior_image_url !== 'null') ? producer.exterior_image_url : '/placeholder.svg'
            }
          };
        });
        setFilteredProducers(formatted);
      }
    } catch (error) {
      console.error('Error searching producers:', error);
    }
  };

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
                    <Link to={`/producer/${producer.slug || encodeURIComponent(producer.producerName)}`} className="block">
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
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">По вашему запросу ничего не найдено.</p>
            )}
          </motion.div>
        )}
        
        {/* If no search query show categories first, then map */}
        {searchQuery.trim() === '' && (
          <>
            <CategoryList categories={categories} />
            
            {/* Public Points Map - at the end before footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold mb-6">Точки выдачи</h2>
              <PublicPointsMap 
                mode="all" 
                showCityFilter={true}
                showPointsList={true}
                height="400px"
              />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
