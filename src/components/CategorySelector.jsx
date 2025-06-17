
import React from 'react'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'

const CategorySelector = ({ selectedCategories, onCategoriesChange, errors }) => {
  const availableCategories = [
    { slug: 'desserts', title: 'Десерты' },
    { slug: 'moldavian', title: 'Молдавская кухня' },
    { slug: 'european', title: 'Европейская кухня' },
    { slug: 'panasian', title: 'Паназиатская кухня' },
    { slug: 'drinks', title: 'Напитки' },
    { slug: 'vegan', title: 'Веганская' },
    { slug: 'vegetarian', title: 'Вегетарианская' },
    { slug: 'healthy', title: 'Здоровое питание' },
    { slug: 'bakery', title: 'Выпечка' },
    { slug: 'meat', title: 'Мясные блюда' }
  ]

  const handleCategoryChange = (categorySlug, checked) => {
    let updatedCategories
    if (checked) {
      updatedCategories = [...selectedCategories, categorySlug]
    } else {
      updatedCategories = selectedCategories.filter(cat => cat !== categorySlug)
    }
    onCategoriesChange(updatedCategories)
  }

  return (
    <div>
      <Label className="text-base font-medium text-gray-900">
        Категории (выберите одну или несколько)
      </Label>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {availableCategories.map((category) => (
          <div key={category.slug} className="flex items-center space-x-2">
            <Checkbox
              id={category.slug}
              checked={selectedCategories.includes(category.slug)}
              onCheckedChange={(checked) => handleCategoryChange(category.slug, checked)}
            />
            <Label 
              htmlFor={category.slug}
              className="text-sm font-normal cursor-pointer"
            >
              {category.title}
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
