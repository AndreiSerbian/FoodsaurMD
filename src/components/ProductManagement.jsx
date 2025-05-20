
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  updateProduct, 
  addProduct, 
  deleteProduct, 
  updateProducerDiscountTime 
} from '../data/products';
import { useToast } from '../components/ui/use-toast';

const ProductManagement = ({ producer }) => {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [discountTime, setDiscountTime] = useState(producer.discountAvailableTime);
  
  // Состояние для нового или редактируемого продукта
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    priceRegular: 0,
    priceDiscount: 0,
    image: null
  });
  
  const resetForm = () => {
    setFormData({
      productName: '',
      description: '',
      priceRegular: 0,
      priceDiscount: 0,
      image: null
    });
    setEditingProduct(null);
    setIsAddingNew(false);
  };
  
  const startEditing = (product) => {
    setFormData({
      productName: product.productName,
      description: product.description,
      priceRegular: product.priceRegular,
      priceDiscount: product.priceDiscount,
      image: null
    });
    setEditingProduct(product);
    setIsAddingNew(false);
  };
  
  const startAddingNew = () => {
    resetForm();
    setIsAddingNew(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        image: e.target.files[0]
      });
    } else if (name === 'priceRegular' || name === 'priceDiscount') {
      setFormData({
        ...formData,
        [name]: Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleDiscountTimeUpdate = () => {
    updateProducerDiscountTime(producer.producerName, discountTime);
    toast({
      title: "Успешно обновлено",
      description: "Время действия скидок обновлено.",
      variant: "success"
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверим валидность данных
    if (!formData.productName || !formData.description || formData.priceRegular <= 0) {
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, заполните все обязательные поля.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (editingProduct) {
        // Обновляем существующий продукт
        updateProduct(
          producer.producerName,
          editingProduct.productName,
          {
            productName: formData.productName,
            description: formData.description,
            priceRegular: formData.priceRegular,
            priceDiscount: formData.priceDiscount
          }
        );
        
        toast({
          title: "Успешно обновлено",
          description: `Товар "${formData.productName}" обновлен.`,
          variant: "success"
        });
      } else if (isAddingNew) {
        // Добавляем новый продукт
        addProduct(
          producer.producerName,
          {
            productName: formData.productName,
            description: formData.description,
            priceRegular: formData.priceRegular,
            priceDiscount: formData.priceDiscount,
            get image() { return "/placeholder.svg"; } // В реальном приложении загружали бы изображение
          }
        );
        
        toast({
          title: "Успешно добавлено",
          description: `Товар "${formData.productName}" добавлен.`,
          variant: "success"
        });
      }
      
      resetForm();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении товара.",
        variant: "destructive"
      });
      console.error("Product save error:", error);
    }
  };
  
  const handleDelete = (productName) => {
    if (window.confirm(`Вы уверены, что хотите удалить товар "${productName}"?`)) {
      const success = deleteProduct(producer.producerName, productName);
      
      if (success) {
        toast({
          title: "Успешно удалено",
          description: `Товар "${productName}" удален.`,
          variant: "success"
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Товар не может быть удален.",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="space-y-8">
      <section className="bg-white shadow sm:rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-medium text-gray-900">Время действия скидок</h3>
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <input
            type="text"
            value={discountTime}
            onChange={(e) => setDiscountTime(e.target.value)}
            placeholder="например: с 18:00 до 21:00"
            className="flex-1 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
          <button
            onClick={handleDiscountTimeUpdate}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Обновить
          </button>
        </div>
      </section>
      
      <section className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-gray-900">
            {editingProduct 
              ? `Редактирование товара: ${editingProduct.productName}`
              : isAddingNew 
                ? "Добавление нового товара" 
                : "Управление товарами"
            }
          </h3>
          
          {!editingProduct && !isAddingNew && (
            <button
              onClick={startAddingNew}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Добавить новый товар
            </button>
          )}
        </div>
        
        {(editingProduct || isAddingNew) ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                Название товара *
              </label>
              <input
                type="text"
                name="productName"
                id="productName"
                value={formData.productName}
                onChange={handleInputChange}
                required
                className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Описание товара *
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="priceRegular" className="block text-sm font-medium text-gray-700">
                  Обычная цена (MDL) *
                </label>
                <input
                  type="number"
                  name="priceRegular"
                  id="priceRegular"
                  min="0"
                  step="0.01"
                  value={formData.priceRegular}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="priceDiscount" className="block text-sm font-medium text-gray-700">
                  Цена со скидкой (MDL)
                </label>
                <input
                  type="number"
                  name="priceDiscount"
                  id="priceDiscount"
                  min="0"
                  step="0.01"
                  value={formData.priceDiscount}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Изображение товара
              </label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleInputChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100
                "
              />
              <p className="mt-1 text-sm text-gray-500">
                Рекомендуемый размер: 800x600 пикселей
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Отмена
              </button>
              
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {editingProduct ? "Обновить товар" : "Добавить товар"}
              </button>
            </div>
          </form>
        ) : (
          <motion.div 
            className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {producer.products.map((product, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg overflow-hidden shadow"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={typeof product.image === 'function' ? product.image() : product.image}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {e.target.src = "/placeholder.svg"}}
                  />
                </div>
                
                <div className="p-4">
                  <h4 className="text-lg font-medium text-gray-900">{product.productName}</h4>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium text-green-600">{product.priceDiscount} MDL</span>
                      {product.priceDiscount < product.priceRegular && (
                        <span className="ml-2 line-through text-gray-400">{product.priceRegular} MDL</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(product)}
                        className="p-1 rounded-md hover:bg-gray-200"
                        title="Редактировать"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.productName)}
                        className="p-1 rounded-md hover:bg-gray-200"
                        title="Удалить"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default ProductManagement;
