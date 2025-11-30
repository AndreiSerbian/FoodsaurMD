import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

export default function AdminCategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (data) setCategories(data)
    setLoading(false)
  }

  const handleCreate = () => {
    setEditingId('new')
    setFormData({ name: '', slug: '', description: '', image_url: '' })
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
    })
  }

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        const { data, error } = await supabase
          .from('categories')
          .insert([formData])
          .select()
          .single()

        if (error) throw error
        
        setCategories([...categories, data])
        toast({ title: 'Категория создана' })
      } else {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error

        setCategories(categories.map(c => 
          c.id === editingId ? { ...c, ...formData } : c
        ))
        toast({ title: 'Категория обновлена' })
      }
      
      setEditingId(null)
    } catch (error) {
      console.error('Error saving category:', error)
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось сохранить категорию',
        variant: 'destructive' 
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту категорию?')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (!error) {
      setCategories(categories.filter(c => c.id !== id))
      toast({ title: 'Категория удалена' })
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Загрузка...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление категориями</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Создать категорию
        </Button>
      </div>

      {editingId && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId === 'new' ? 'Новая категория' : 'Редактировать категорию'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Название</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label>URL изображения</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>Сохранить</Button>
              <Button onClick={() => setEditingId(null)} variant="outline">
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">/{category.slug}</p>
                  {category.description && (
                    <p className="text-sm mt-2">{category.description}</p>
                  )}
                  {category.image_url && (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(category)} variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(category.id)} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
