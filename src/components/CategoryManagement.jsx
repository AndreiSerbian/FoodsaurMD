import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useProducerCategories } from '../hooks/useProducerCategories';
import { X, Plus } from 'lucide-react';
const CategoryManagement = ({
  producerProfile
}) => {
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    categories: producerCategories,
    loading: categoriesLoading,
    addCategory,
    removeCategory,
    refetch
  } = useProducerCategories(producerProfile?.id);
  useEffect(() => {
    fetchAllCategories();
  }, []);
  const fetchAllCategories = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('categories').select('*').order('name');
      if (!error && data) {
        setAllCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddCategory = async categoryId => {
    await addCategory(categoryId);
  };
  const handleRemoveCategory = async categoryId => {
    await removeCategory(categoryId);
  };
  const isSelectedCategory = categoryId => {
    return producerCategories.some(cat => cat.id === categoryId);
  };
  if (loading || categoriesLoading) {
    return <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">Загрузка категорий...</div>
        </div>
      </div>;
  }
  return <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Управление категориями
        </h3>

        {/* Выбранные категории */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-2">
            Выбранные категории:
          </h4>
          {producerCategories.length > 0 ? <div className="flex flex-wrap gap-2">
              {producerCategories.map(category => <Badge key={category.id} variant="default" className="flex items-center gap-1 bg-green-700 text-gray-50 ">
                  {category.name}
                  <Button size="sm" variant="ghost" className="h-4 w-4 p-0 hover:bg-transparent" onClick={() => handleRemoveCategory(category.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>)}
            </div> : <p className="text-gray-500 text-sm">Категории не выбраны</p>}
        </div>

        {/* Доступные категории */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">
            Доступные категории:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allCategories.map(category => {
            const isSelected = isSelectedCategory(category.id);
            return <Card key={category.id} className={`cursor-pointer transition-colors ${isSelected ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`} onClick={() => {
              if (isSelected) {
                handleRemoveCategory(category.id);
              } else {
                handleAddCategory(category.id);
              }
            }}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{category.name}</div>
                        {category.description && <div className="text-xs text-gray-500 mt-1">
                            {category.description}
                          </div>}
                      </div>
                      <div>
                        {isSelected ? <Badge variant="default" className="text-xs bg-green-700 text-gray-50">
                            Выбрано
                          </Badge> : <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                            <Plus className="h-3 w-3" />
                          </Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>
      </div>
    </div>;
};
export default CategoryManagement;