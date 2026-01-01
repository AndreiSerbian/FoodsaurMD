import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Clock, Package, Send } from 'lucide-react';
import { createPoint, updatePoint, getPointTelegramSettings, upsertPointTelegramSettings, sendTestTelegramNotification } from '@/modules/points/pointsApi.js';
import { createDefaultWorkHours, validateDayHours, WEEKDAYS_FULL } from '@/modules/points/workHoursUtil.js';
import { useToast } from '@/hooks/use-toast';
import PointInventoryManager from './PointInventoryManager';
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
  const [savedPointId, setSavedPointId] = useState<string | null>(null);
  const [telegramSettings, setTelegramSettings] = useState({
    bot_token: '',
    chat_id: '',
    is_active: false,
    notify_status_changes: true
  });
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
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
      setSavedPointId(point.id);
      // Load Telegram settings for existing point
      loadTelegramSettings(point.id);
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
      setSavedPointId(null);
      setTelegramSettings({
        bot_token: '',
        chat_id: '',
        is_active: false,
        notify_status_changes: true
      });
    }
    setErrors({});
  }, [point, isOpen]);

  const loadTelegramSettings = async (pointId: string) => {
    try {
      const settings = await getPointTelegramSettings(pointId);
      if (settings) {
        setTelegramSettings({
          bot_token: settings.bot_token || '',
          chat_id: settings.chat_id || '',
          is_active: settings.is_active,
          notify_status_changes: settings.notify_status_changes ?? true
        });
      }
    } catch (error) {
      console.error('Failed to load Telegram settings:', error);
    }
  };

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
        setSavedPointId(point.id);
        toast({
          title: 'Успешно',
          description: 'Точка выдачи обновлена',
        });
      } else {
        const result = await createPoint(payload);
        setSavedPointId(result.id);
        toast({
          title: 'Успешно',
          description: 'Точка выдачи создана',
        });
      }

      // Не закрываем сразу, даем возможность управлять товарами
      if (point) {
        onSuccess();
        onClose();
      }
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

  const handleSaveTelegramSettings = async () => {
    if (!savedPointId && !point) {
      toast({
        title: 'Ошибка',
        description: 'Сначала сохраните основные данные точки',
        variant: 'destructive',
      });
      return;
    }

    const pointId = savedPointId || point?.id;
    if (!pointId) return;

    setTelegramLoading(true);
    try {
      await upsertPointTelegramSettings(pointId, telegramSettings);
      toast({
        title: 'Успешно',
        description: 'Настройки Telegram сохранены',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки Telegram',
        variant: 'destructive',
      });
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramSettings.bot_token || !telegramSettings.chat_id) {
      toast({
        title: 'Ошибка',
        description: 'Заполните Bot Token и Chat ID',
        variant: 'destructive',
      });
      return;
    }

    setTestingTelegram(true);
    try {
      const result = await sendTestTelegramNotification(
        telegramSettings.bot_token,
        telegramSettings.chat_id
      );

      if (result.success) {
        toast({
          title: 'Успешно',
          description: 'Тестовое сообщение отправлено',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: result.error || 'Не удалось отправить тестовое сообщение',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить тестовое сообщение',
        variant: 'destructive',
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {point ? 'Редактировать точку выдачи' : 'Добавить точку выдачи'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="gap-2">
              <Clock className="h-4 w-4" />
              Основные данные
            </TabsTrigger>
            <TabsTrigger value="telegram" className="gap-2" disabled={!savedPointId && !point}>
              <Send className="h-4 w-4" />
              Telegram
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2" disabled={!savedPointId && !point}>
              <Package className="h-4 w-4" />
              Управление товарами
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
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
          </TabsContent>

          <TabsContent value="telegram" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Настройки Telegram уведомлений</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bot_token">Bot Token</Label>
                  <Input
                    id="bot_token"
                    type="password"
                    value={telegramSettings.bot_token}
                    onChange={(e) => setTelegramSettings(prev => ({ ...prev, bot_token: e.target.value }))}
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  />
                  <p className="text-sm text-muted-foreground">
                    Создайте бота через @BotFather в Telegram и получите токен
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chat_id">Chat ID</Label>
                  <Input
                    id="chat_id"
                    value={telegramSettings.chat_id}
                    onChange={(e) => setTelegramSettings(prev => ({ ...prev, chat_id: e.target.value }))}
                    placeholder="-1001234567890"
                  />
                  <p className="text-sm text-muted-foreground">
                    ID чата или канала для получения уведомлений. Используйте @userinfobot для получения ID
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={telegramSettings.is_active}
                    onCheckedChange={(checked) => setTelegramSettings(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Уведомления о новых заказах</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={telegramSettings.notify_status_changes}
                    onCheckedChange={(checked) => setTelegramSettings(prev => ({ ...prev, notify_status_changes: checked }))}
                  />
                  <Label>Уведомления об изменении статуса заказа</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={testingTelegram || !telegramSettings.bot_token || !telegramSettings.chat_id}
                    variant="outline"
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {testingTelegram ? 'Отправка...' : 'Тестовое сообщение'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveTelegramSettings}
                    disabled={telegramLoading}
                  >
                    {telegramLoading ? 'Сохранение...' : 'Сохранить настройки'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            {(savedPointId || point) && (
              <PointInventoryManager
                pointId={savedPointId || point?.id || ''}
                producerId={producerId}
                isNewPoint={!point && !savedPointId}
              />
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
              >
                Завершить
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}