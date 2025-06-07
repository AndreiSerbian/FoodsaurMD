
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProducerImageSlider = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
        <img 
          src="/placeholder.svg"
          alt="Изображение"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const goToPrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentImage = images[currentIndex];

  return (
    <div className="relative h-48 overflow-hidden group">
      <img 
        src={currentImage.url}
        alt={currentImage.label}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg";
        }}
      />
      
      {/* Навигационные стрелки (показываются только если изображений больше 1) */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
            aria-label="Предыдущее изображение"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
            aria-label="Следующее изображение"
          >
            <ChevronRight size={16} />
          </button>

          {/* Индикаторы */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Изображение ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProducerImageSlider;
