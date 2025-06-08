
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ProducerCard from './ProducerCard';

const ProducersList = ({ producers, categoryName }) => {
  const { t } = useTranslation();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-2 text-center text-green-900">{categoryName}</h2>
          <p className="text-green-600 text-center mb-8">{t('producers.subtitle')}</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
          variants={container} 
          initial="hidden" 
          animate="show"
        >
          {producers.map((producer, index) => (
            <motion.div 
              key={producer.id || index} 
              variants={item} 
              className="producer-card h-full"
            >
              <ProducerCard producer={producer} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProducersList;
