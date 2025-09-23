import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import ProductInventoryManager from './ProductInventoryManager';
const ProductManagement = ({
  profile
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddForm(true);
    setIsOpen(true); // Automatically open the section when adding a product
  };
  const handleEditProduct = product => {
    setEditingProduct(product);
    setShowAddForm(true);
    setIsOpen(true); // Automatically open the section when editing a product
  };
  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };
  const handleSaveProduct = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setRefreshKey(prev => prev + 1); // Обновляем список товаров
  };
  const handleDeleteProduct = () => {
    setRefreshKey(prev => prev + 1); // Обновляем список товаров
  };
  
  const handleViewProducts = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowAddForm(false);
      setEditingProduct(null);
    }
  };
  if (!profile?.id) {
    return <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500 text-center">
            Сначала заполните профиль производителя
          </p>
        </div>
      </div>;
  }
  return <div className="bg-white overflow-hidden shadow rounded-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-50">
                Управление товарами
              </h3>
              <ChevronDown className={`h-4 w-4 text-gray-50 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleViewProducts} 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
              >
                {isOpen ? 'Скрыть товары' : 'Просмотреть товары'}
              </Button>
              <Button 
                onClick={handleAddProduct} 
                className="bg-green-900 hover:bg-green-800 text-gray-50 w-full sm:w-auto"
              >
                Добавить товар
              </Button>
            </div>
          </div>

          <CollapsibleContent className="space-y-4">
            <ProductList key={refreshKey} producerProfile={profile} onEditProduct={handleEditProduct} onDeleteProduct={handleDeleteProduct} />
            
            <div className="mt-8">
              <ProductInventoryManager producerProfile={profile} />
            </div>

            {showAddForm && <ProductForm product={editingProduct} producerProfile={profile} onSave={handleSaveProduct} onCancel={handleCloseForm} />}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>;
};
export default ProductManagement;