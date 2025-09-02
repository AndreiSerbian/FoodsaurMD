import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
const ProductManagement = ({
  profile
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddForm(true);
  };
  const handleEditProduct = product => {
    setEditingProduct(product);
    setShowAddForm(true);
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
          <div className="flex justify-between items-center mb-6">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
              <h3 className="text-lg leading-6 font-medium text-gray-50">
                Управление товарами
              </h3>
              <ChevronDown className={`h-4 w-4 text-gray-50 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <Button onClick={handleAddProduct} className="bg-green-900 hover:bg-green-800 text-gray-50">
              Добавить товар
            </Button>
          </div>

          <CollapsibleContent className="space-y-4">
            <ProductList key={refreshKey} producerProfile={profile} onEditProduct={handleEditProduct} onDeleteProduct={handleDeleteProduct} />

            {showAddForm && <ProductForm product={editingProduct} producerProfile={profile} onSave={handleSaveProduct} onCancel={handleCloseForm} />}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>;
};
export default ProductManagement;