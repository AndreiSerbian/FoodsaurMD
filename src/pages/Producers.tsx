
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducersByCategory } from '../hooks/useProducersWithProducts';
import { useCategoryBySlug } from '../hooks/useCategories';
import ProducersList from '../components/ProducersList';

const Producers = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : '';
  
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(decodedCategoryName);
  const { data: producers = [], isLoading: producersLoading, error } = useProducersByCategory(decodedCategoryName);

  const loading = categoryLoading || producersLoading;

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

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Категория не найдена</h2>
        <p className="text-gray-600 mb-8">К сожалению, такой категории нет либо в ней нет ресторанов.</p>
        <Link 
          to="/" 
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-300"
        >
          Вернуться на главную
        </Link>
      </div>
    );
  }

  if (producers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Производители не найдены</h2>
        <p className="text-gray-600 mb-8">В этой категории пока нет производителей.</p>
        <Link 
          to="/" 
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-300"
        >
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
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-primary transition duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к категориям
          </Link>
        </motion.div>
        
        <ProducersList producers={producers} categoryName={category.name} />
      </div>
    </div>
  );
};

export default Producers;
