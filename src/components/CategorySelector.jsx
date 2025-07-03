
import React, { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'

const CategorySelector = ({ selectedCategories, onCategoriesChange, errors, producerProfile }) => {
  const [availableCategories, setAvailableCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (!error && data) {
        setAvailableCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = async (categoryId, checked) => {
    if (!producerProfile?.id) {
      // Если профиль еще не создан, работаем с локальным состоянием
      let updatedCategories
      if (checked) {
        updatedCategories = [...selectedCategories, categoryId]
      } else {
        updatedCategories = selectedCategories.filter(cat => cat !== categoryId)
      }
      onCategoriesChange(updatedCategories)
      return
    }

    try {
      if (checked) {
        // Добавляем связь
        const { error } = await supabase
          .from('producer_categories')
          .insert({
            producer_id: producerProfile.id,
            category_id: categoryId
          })

        if (!error) {
          onCategoriesChange([...selectedCategories, categoryId])
        }
      } else {
        // Удаляем связь
        const { error } = await supabase
          .from('producer_categories')
          .delete()
          .eq('producer_id', producerProfile.id)
          .eq('category_id', categoryId)

        if (!error) {
          onCategoriesChange(selectedCategories.filter(cat => cat !== categoryId))
        }
      }
    } catch (error) {
      console.error('Error updating producer categories:', error)
    }
  }

  if (loading) {
    return <div>Загрузка категорий...</div>
  }

  return (
    <div>
      <Label className="text-base font-medium text-gray-900">
        Категории (выберите одну или несколько)
      </Label>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {availableCategories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <Checkbox
              id={category.id}
              checked={selectedCategories.includes(category.id)}
              onCheckedChange={(checked) => handleCategoryChange(category.id, checked)}
            />
            <Label 
              htmlFor={category.id}
              className="text-sm font-normal cursor-pointer"
            >
              {category.name}
            </Label>
          </div>
        ))}
      </div>
      {errors?.categories && (
        <p className="mt-1 text-sm text-red-600">{errors.categories}</p>
      )}
    </div>
  )
}

export default CategorySelector
