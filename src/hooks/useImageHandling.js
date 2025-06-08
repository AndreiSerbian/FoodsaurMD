
import { useState } from 'react';

export const useImageHandling = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = (e, imagesLength) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % imagesLength);
  };
  
  const handlePrevImage = (e, imagesLength) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + imagesLength) % imagesLength);
  };
  
  const handleImageError = (e) => {
    e.target.src = "/placeholder.svg";
  };

  return {
    currentImageIndex,
    setCurrentImageIndex,
    handleNextImage,
    handlePrevImage,
    handleImageError
  };
};
