
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
            <motion.div key={index} variants={item} className="producer-card rounded-2xl shadow-md overflow-hidden">
              <Link to={`/producer/${encodeURIComponent(producer.producerName)}`} className="block">
                <div className="relative h-48">
                  <Carousel className="w-full h-full">
                    <CarouselContent className="h-full">
                      {producer.producerImage.exterior && (
                        <CarouselItem className="h-full">
                          <img 
                            src={producer.producerImage.exterior || "/placeholder.svg"}
                            alt={`${producer.producerName} - экстерьер`}
                            className="w-full h-full object-cover"
                          />
                        </CarouselItem>
                      )}
                      {producer.producerImage.interior && (
                        <CarouselItem className="h-full">
                          <img 
                            src={producer.producerImage.interior || "/placeholder.svg"}
                            alt={`${producer.producerName} - интерьер`}
                            className="w-full h-full object-cover"
                          />
                        </CarouselItem>
                      )}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 bg-white/70 hover:bg-white" />
                    <CarouselNext className="right-2 bg-white/70 hover:bg-white" />
                  </Carousel>
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
