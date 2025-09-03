import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { X, Clock, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const PointForm = ({ point, onSave, onCancel, producerProfile }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    city: '',
    address: '',
    is_active: true,
    work_hours: {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: []
    }
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Функция для добавления всех товаров производителя в точку выдачи
  const addAllProductsToPoint = async (pointId, producerId) => {
    try {
      // Получаем все товары производителя
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, quantity, in_stock')
        .eq('producer_id', producerId);

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        // Добавляем все товары в точку выдачи
        const pickupPointProducts = products.map(product => ({
          pickup_point_id: pointId,
          product_id: product.id,
          quantity_available: product.quantity,
          is_available: product.in_stock
        }));

        const { error: insertError } = await supabase
          .from('pickup_point_products')
          .insert(pickupPointProducts);

        if (insertError) throw insertError;

        console.log(`Added ${products.length} products to pickup point ${pointId}`);
      }
    } catch (error) {
      console.error('Error adding products to pickup point:', error);
      // Не показываем ошибку пользователю, так как точка все равно создана
    }
  };

  const WEEKDAYS = {
    mon: 'Понедельник',
    tue: 'Вторник', 
    wed: 'Среда',
    thu: 'Четверг',
    fri: 'Пятница',
    sat: 'Суббота',
    sun: 'Воскресенье'
  };

  useEffect(() => {
    if (point) {
      setFormData({
        name: point.name || '',
        title: point.title || '',
        city: point.city || '',
        address: point.address || '',
        is_active: point.is_active,
        work_hours: point.work_hours || {
          mon: [],
          tue: [],
          wed: [],
          thu: [],
          fri: [],
          sat: [],
          sun: []
        }
      });
    } else {
      // Установить дефолтные часы работы для новой точки
      setFormData(prev => ({
        ...prev,
        work_hours: {
          mon: [{ open: '09:00', close: '18:00' }],
          tue: [{ open: '09:00', close: '18:00' }],
          wed: [{ open: '09:00', close: '18:00' }],
          thu: [{ open: '09:00', close: '18:00' }],
          fri: [{ open: '09:00', close: '18:00' }],
          sat: [{ open: '10:00', close: '16:00' }],
          sun: []
        }
      }));
    }
  }, [point]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pointData = {
        producer_id: producerProfile.id,
        name: formData.title || formData.address, // name - обязательное поле в БД
        title: formData.title || null,
        city: formData.city,
        address: formData.address,
        is_active: formData.is_active,
        work_hours: formData.work_hours
      };

      let result;
      const isEditing = !!point?.id;

      if (isEditing) {
        result = await supabase
          .from('pickup_points')
          .update(pointData)
          .eq('id', point.id)
          .select()
          .single();
        
        if (result.error) throw result.error;
        
        toast({
          title: "Успешно",
          description: "Точка выдачи обновлена"
        });
      } else {
        result = await supabase
          .from('pickup_points')
          .insert(pointData)
          .select()
          .single();
        
        if (result.error) throw result.error;

        // Если создаем новую точку, добавляем все товары производителя
        await addAllProductsToPoint(result.data.id, producerProfile.id);
        
        toast({
          title: "Успешно", 
          description: "Точка выдачи создана"
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving pickup point:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить точку выдачи",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addTimeRange = (day) => {
    const currentHours = formData.work_hours[day];
    setFormData({
      ...formData,
      work_hours: {
        ...formData.work_hours,
        [day]: [...currentHours, { open: '09:00', close: '18:00' }]
      }
    });
  };

  const removeTimeRange = (day, index) => {
    const currentHours = formData.work_hours[day];
    setFormData({
      ...formData,
      work_hours: {
        ...formData.work_hours,
        [day]: currentHours.filter((_, i) => i !== index)
      }
    });
  };

  const updateTimeRange = (day, index, field, value) => {
    const currentHours = formData.work_hours[day];
    const updatedHours = currentHours.map((range, i) => 
      i === index ? { ...range, [field]: value } : range
    );
    setFormData({
      ...formData,
      work_hours: {
        ...formData.work_hours,
        [day]: updatedHours
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {point ? 'Редактировать точку выдачи' : 'Добавить точку выдачи'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Название (необязательно)</Label>
              <Input 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="Например: Центральный офис"
              />
            </div>

            <div>
              <Label htmlFor="city">Город *</Label>
              <Input 
                id="city" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                required 
                placeholder="Кишинев"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Адрес *</Label>
              <Input 
                id="address" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
                placeholder="ул. Штефан чел Маре 123"
              />
            </div>
          </div>

          {/* Статус */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label>Точка активна</Label>
          </div>

          {/* Часы работы */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <h3 className="text-lg font-medium">Часы работы</h3>
            </div>

            <div className="space-y-3">
              {Object.entries(WEEKDAYS).map(([day, dayName]) => {
                const dayHours = formData.work_hours[day];
                
                return (
                  <div key={day} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{dayName}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeRange(day)}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Добавить интервал
                      </Button>
                    </div>

                    {dayHours.length === 0 ? (
                      <p className="text-sm text-gray-500">Выходной</p>
                    ) : (
                      <div className="space-y-2">
                        {dayHours.map((range, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={range.open}
                              onChange={(e) => updateTimeRange(day, index, 'open', e.target.value)}
                              className="w-32"
                            />
                            <span>—</span>
                            <Input
                              type="time"
                              value={range.close}
                              onChange={(e) => updateTimeRange(day, index, 'close', e.target.value)}
                              className="w-32"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTimeRange(day, index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PointForm;