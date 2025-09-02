import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Clock } from 'lucide-react';
import { createPoint, updatePoint } from '@/modules/points/pointsApi.js';
import { createDefaultWorkHours, validateDayHours, WEEKDAYS_FULL } from '@/modules/points/workHoursUtil.js';
import { useToast } from '@/hooks/use-toast';
import type { PickupPoint, WorkHours, TimeRange } from '@/types/supabase-points';

interface PointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  point?: PickupPoint | null;
  producerId: string;
}

export default function PointModal({ isOpen, onClose, onSuccess, point, producerId }: PointModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    address: '',
    lat: '',
    lng: '',
    is_active: true,
    work_hours: createDefaultWorkHours()
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (point) {
      setFormData({
        title: point.title || '',
        city: point.city,
        address: point.address,
        lat: point.lat?.toString() || '',
        lng: point.lng?.toString() || '',
        is_active: point.is_active,
        work_hours: point.work_hours || createDefaultWorkHours()
      });
    } else {
      setFormData({
        title: '',
        city: '',
        address: '',
        lat: '',
        lng: '',
        is_active: true,
        work_hours: createDefaultWorkHours()
      });
    }
    setErrors({});
  }, [point, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.city.trim()) {
      newErrors.city = 'Город обязателен';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен';
    }

    if (formData.lat && isNaN(Number(formData.lat))) {
      newErrors.lat = 'Неверный формат широты';
    }

    if (formData.lng && isNaN(Number(formData.lng))) {
      newErrors.lng = 'Неверный формат долготы';
    }

    // Валидация часов работы
    Object.keys(formData.work_hours).forEach(day => {
      const dayHours = formData.work_hours[day as keyof WorkHours];
      const validation = validateDayHours(dayHours);
      if (!validation.valid) {
        newErrors[`work_hours_${day}`] = validation.error || 'Ошибка в расписании';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        producer_id: producerId,
        name: formData.title || formData.address, // name - обязательное поле в БД
        title: formData.title || null,
        city: formData.city,
        address: formData.address,
        lat: formData.lat ? Number(formData.lat) : null,
        lng: formData.lng ? Number(formData.lng) : null,
        is_active: formData.is_active,
        work_hours: formData.work_hours
      };

      if (point) {
        await updatePoint(point.id, payload);
        toast({
          title: 'Успешно',
          description: 'Точка выдачи обновлена',
        });
      } else {
        await createPoint(payload);
        toast({
          title: 'Успешно',
          description: 'Точка выдачи создана',
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: point ? 'Не удалось обновить точку выдачи' : 'Не удалось создать точку выдачи',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWorkHours = (day: keyof WorkHours, hours: TimeRange[]) => {
    setFormData(prev => ({
      ...prev,
      work_hours: {
        ...prev.work_hours,
        [day]: hours
      }
    }));
  };

  const addTimeRange = (day: keyof WorkHours) => {
    const currentHours = formData.work_hours[day];
    updateWorkHours(day, [...currentHours, { open: '09:00', close: '18:00' }]);
  };

  const removeTimeRange = (day: keyof WorkHours, index: number) => {
    const currentHours = formData.work_hours[day];
    updateWorkHours(day, currentHours.filter((_, i) => i !== index));
  };

  const updateTimeRange = (day: keyof WorkHours, index: number, field: 'open' | 'close', value: string) => {
    const currentHours = formData.work_hours[day];
    const updatedHours = currentHours.map((range, i) => 
      i === index ? { ...range, [field]: value } : range
    );
    updateWorkHours(day, updatedHours);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {point ? 'Редактировать точку выдачи' : 'Добавить точку выдачи'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Название (необязательно)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Например: Центральный офис"
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="city">Город *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Кишинев"
              />
              {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Адрес *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="ул. Штефан чел Маре 123"
              />
              {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
            </div>

            <div>
              <Label htmlFor="lat">Широта (необязательно)</Label>
              <Input
                id="lat"
                value={formData.lat}
                onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                placeholder="47.0105"
              />
              {errors.lat && <p className="text-sm text-destructive mt-1">{errors.lat}</p>}
            </div>

            <div>
              <Label htmlFor="lng">Долгота (необязательно)</Label>
              <Input
                id="lng"
                value={formData.lng}
                onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                placeholder="28.8638"
              />
              {errors.lng && <p className="text-sm text-destructive mt-1">{errors.lng}</p>}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Часы работы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.entries(WEEKDAYS_FULL) as [keyof WorkHours, string][]).map(([day, dayName]) => {
                const dayKey = day as keyof WorkHours;
                const dayHours = formData.work_hours[dayKey];
                const hasError = errors[`work_hours_${day}`];

                return (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{dayName}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeRange(dayKey)}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Добавить интервал
                      </Button>
                    </div>

                    {dayHours.length === 0 ? (
                      <Badge variant="outline">Выходной</Badge>
                    ) : (
                      <div className="space-y-2">
                        {dayHours.map((range, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={range.open}
                              onChange={(e) => updateTimeRange(dayKey, index, 'open', e.target.value)}
                              className="w-32"
                            />
                            <span>—</span>
                            <Input
                              type="time"
                              value={range.close}
                              onChange={(e) => updateTimeRange(dayKey, index, 'close', e.target.value)}
                              className="w-32"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTimeRange(dayKey, index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {hasError && (
                      <p className="text-sm text-destructive">{errors[`work_hours_${day}`]}</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : point ? 'Обновить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}