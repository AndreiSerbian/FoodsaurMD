
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useImageHandling } from '../hooks/useImageHandling';

const ImageSlider = ({ images, alt, className = "w-full h-48" }) => {
  const { currentImageIndex, handleNextImage, handlePrevImage, handleImageError } = useImageHandling();

  if (!images || images.length === 0) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`${className} relative overflow-hidden`}>
        <img 
          src={images[currentImageIndex].url} 
          alt={`${alt} - ${images[currentImageIndex].label}`} 
          className="w-full h-full object-cover transition-transform duration-300" 
          onError={handleImageError} 
        />
        
        {images[currentImageIndex].label && (
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
            {images[currentImageIndex].label}
          </div>
        )}
        
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => handlePrevImage(e, images.length)} 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-1.5 backdrop-blur-sm transition-colors" 
              aria-label="Предыдущее фото"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button 
              onClick={(e) => handleNextImage(e, images.length)} 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-1.5 backdrop-blur-sm transition-colors" 
              aria-label="Следующее фото"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageSlider;
