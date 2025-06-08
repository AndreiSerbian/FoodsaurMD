
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { usePricing } from '../hooks/usePricing';

const ProductCard = ({ product, index, item }) => {
  const { t } = useTranslation();
  const { calculateDiscount, getDisplayPrice } = usePricing();
  
  const { regular, discount, hasDiscount, displayPrice } = getDisplayPrice(
    product.price_regular, 
    product.price_discount
  );

  return (
    <motion.div 
      key={`${product.name}-${index}`} 
      variants={item} 
      className="product-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative">
        <img 
          src={product.image_url || "/placeholder.svg"} 
          alt={product.name || t('products.noName')} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            console.log('Image error for product:', product.name);
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        {hasDiscount && discount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
            -{calculateDiscount(regular, discount)}%
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{product.name || t('products.noName')}</h3>
        <p className="text-gray-600 text-sm mb-4 h-20 overflow-hidden">
          {product.description || t('products.noDescription')}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-lg font-bold text-green-600">
              {displayPrice} MDL
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {regular} MDL
              </span>
            )}
          </div>
        </div>
        
        <motion.button 
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
          onClick={() => console.log('Add to cart:', product.name)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShoppingCart size={20} className="mr-2" />
          {t('common.addToCart')}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
