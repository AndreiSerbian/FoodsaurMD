
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProducersList = ({ producers, categoryName }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">{categoryName}</h2>
        <p className="text-gray-600 text-center mb-8">Выберите ресторан с уцененными товарами</p>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {producers.map((producer, index) => (
            <motion.div key={index} variants={item} className="producer-card">
              <Link to={`/producer/${encodeURIComponent(producer.producerName)}`} className="block">
                <div className="relative">
                  <img 
                    src={producer.producerImage.exterior || "/placeholder.svg"}
                    alt={producer.producerName}
                    className="w-full h-48 object-cover rounded-t-2xl"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{producer.producerName}</h3>
                  <p className="text-gray-600 text-sm mb-3">{producer.address}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Скидки доступны {producer.discountAvailableTime}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProducersList;
