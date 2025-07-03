
import { useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'

export const useProducerCategories = (producerId) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (producerId) {
      fetchProducerCategories()
    }
  }, [producerId])

  const fetchProducerCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('producer_categories')
        .select(`
          category_id,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('producer_id', producerId)

      if (!error && data) {
        setCategories(data.map(item => item.categories))
      }
    } catch (error) {
      console.error('Error fetching producer categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (categoryId) => {
    try {
      const { error } = await supabase
        .from('producer_categories')
        .insert({
          producer_id: producerId,
          category_id: categoryId
        })

      if (!error) {
        await fetchProducerCategories()
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const removeCategory = async (categoryId) => {
    try {
      const { error } = await supabase
        .from('producer_categories')
        .delete()
        .eq('producer_id', producerId)
        .eq('category_id', categoryId)

      if (!error) {
        await fetchProducerCategories()
      }
    } catch (error) {
      console.error('Error removing category:', error)
    }
  }

  return {
    categories,
    loading,
    addCategory,
    removeCategory,
    refetch: fetchProducerCategories
  }
}
