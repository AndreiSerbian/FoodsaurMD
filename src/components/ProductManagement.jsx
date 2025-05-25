
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../components/ui/use-toast';
import { useProducerProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducerProducts';
import { useUpdateProducerProfile } from '../hooks/useProducerProfile';

const ProductManagement = ({ producer }) => {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [discountTime, setDiscountTime] = useState(producer?.discount_available_time || '');
  
  const { data: products = [], isLoading } = useProducerProducts(producer?.id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateProfile = useUpdateProducerProfile();
  
  // Состояние для нового или редактируемого продукта
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_regular: 0,
    price_discount: 0,
    quantity: 0,
    image_url: ''
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_regular: 0,
      price_discount: 0,
      quantity: 0,
      image_url: ''
    });
    setEditingProduct(null);
    setIsAddingNew(false);
  };
  
  const startEditing = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price_regular: product.price_regular,
      price_discount: product.price_discount || 0,
      quantity: product.quantity,
      image_url: product.image_url || ''
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
    
    if (name === 'price_regular' || name === 'price_discount' || name === 'quantity') {
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
  
  const handleDiscountTimeUpdate = async () => {
    try {
      await updateProfile.mutateAsync({
        discount_available_time: discountTime
      });
      
      toast({
        title: "Успешно обновлено",
        description: "Время действия скидок обновлено.",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить время действия скидок.",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверим валидность данных
    if (!formData.name || !formData.description || formData.price_regular <= 0) {
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
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          name: formData.name,
          description: formData.description,
          price_regular: formData.price_regular,
          price_discount: formData.price_discount || null,
          quantity: formData.quantity,
          image_url: formData.image_url || null
        });
        
        toast({
          title: "Успешно обновлено",
          description: `Товар "${formData.name}" обновлен.`,
        });
      } else if (isAddingNew) {
        // Добавляем новый продукт
        await createProduct.mutateAsync({
          producer_id: producer.id,
          name: formData.name,
          description: formData.description,
          price_regular: formData.price_regular,
          price_discount: formData.price_discount || null,
          quantity: formData.quantity,
          image_url: formData.image_url || "/placeholder.svg"
        });
        
        toast({
          title: "Успешно добавлено",
          description: `Товар "${formData.name}" добавлен.`,
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
  
  const handleDelete = async (product) => {
    if (window.confirm(`Вы уверены, что хотите удалить товар "${product.name}"?`)) {
      try {
        await deleteProduct.mutateAsync(product.id);
        
        toast({
          title: "Успешно удалено",
          description: `Товар "${product.name}" удален.`,
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Товар не может быть удален.",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>;
  }
  
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
            disabled={updateProfile.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Обновление...' : 'Обновить'}
          </button>
        </div>
      </section>
      
      <section className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-gray-900">
            {editingProduct 
              ? `Редактирование товара: ${editingProduct.name}`
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Название товара *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="price_regular" className="block text-sm font-medium text-gray-700">
                  Обычная цена (MDL) *
                </label>
                <input
                  type="number"
                  name="price_regular"
                  id="price_regular"
                  min="0"
                  step="0.01"
                  value={formData.price_regular}
                  onChange={handleInputChange}
                  required
                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="price_discount" className="block text-sm font-medium text-gray-700">
                  Цена со скидкой (MDL)
                </label>
                <input
                  type="number"
                  name="price_discount"
                  id="price_discount"
                  min="0"
                  step="0.01"
                  value={formData.price_discount}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Количество
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                URL изображения товара
              </label>
              <input
                type="url"
                name="image_url"
                id="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
                disabled={createProduct.isPending || updateProduct.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {createProduct.isPending || updateProduct.isPending 
                  ? 'Сохранение...' 
                  : editingProduct ? "Обновить товар" : "Добавить товар"
                }
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
            {products.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg overflow-hidden shadow"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {e.target.src = "/placeholder.svg"}}
                  />
                </div>
                
                <div className="p-4">
                  <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium text-green-600">
                        {product.price_discount || product.price_regular} MDL
                      </span>
                      {product.price_discount && product.price_discount < product.price_regular && (
                        <span className="ml-2 line-through text-gray-400">{product.price_regular} MDL</span>
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
                        onClick={() => handleDelete(product)}
                        disabled={deleteProduct.isPending}
                        className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50"
                        title="Удалить"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    Количество: {product.quantity}
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
