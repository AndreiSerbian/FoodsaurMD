import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, MapPin, Clock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const PickupPointManagement = ({ producerProfile }) => {
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    working_hours_from: '',
    working_hours_to: '',
    discount_available_from: '',
    discount_available_to: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (producerProfile?.id) {
      fetchPickupPoints();
    }
  }, [producerProfile]);

  const fetchPickupPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('producer_id', producerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPickupPoints(data || []);
    } catch (error) {
      console.error('Error fetching pickup points:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить точки выдачи",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPoint) {
        const { error } = await supabase
          .from('pickup_points')
          .update(formData)
          .eq('id', editingPoint.id);

        if (error) throw error;
        toast({
          title: "Успешно",
          description: "Точка выдачи обновлена"
        });
      } else {
        const { error } = await supabase
          .from('pickup_points')
          .insert({
            ...formData,
            producer_id: producerProfile.id
          });

        if (error) throw error;
        toast({
          title: "Успешно",
          description: "Точка выдачи создана"
        });
      }

      setShowDialog(false);
      setEditingPoint(null);
      resetForm();
      fetchPickupPoints();
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

  const handleEdit = (point) => {
    setEditingPoint(point);
    setFormData({
      name: point.name,
      address: point.address,
      working_hours_from: point.working_hours_from || '',
      working_hours_to: point.working_hours_to || '',
      discount_available_from: point.discount_available_from || '',
      discount_available_to: point.discount_available_to || '',
      is_active: point.is_active
    });
    setShowDialog(true);
  };

  const handleDelete = async (pointId) => {
    if (!confirm('Вы уверены, что хотите удалить эту точку выдачи?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pickup_points')
        .delete()
        .eq('id', pointId);

      if (error) throw error;
      
      toast({
        title: "Успешно",
        description: "Точка выдачи удалена"
      });
      fetchPickupPoints();
    } catch (error) {
      console.error('Error deleting pickup point:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить точку выдачи",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      working_hours_from: '',
      working_hours_to: '',
      discount_available_from: '',
      discount_available_to: '',
      is_active: true
    });
  };

  const handleNewPoint = () => {
    setEditingPoint(null);
    resetForm();
    setShowDialog(true);
  };

  if (!producerProfile?.id) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-muted-foreground text-center">
            Сначала заполните профиль производителя
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Точки выдачи
          </CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleNewPoint}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить точку
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPoint ? 'Редактировать точку выдачи' : 'Новая точка выдачи'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Название точки</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Например: Центральная кухня"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    placeholder="Улица, дом, район"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="working_hours_from">Работает с</Label>
                    <Input
                      id="working_hours_from"
                      type="time"
                      value={formData.working_hours_from}
                      onChange={(e) => setFormData({...formData, working_hours_from: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="working_hours_to">Работает до</Label>
                    <Input
                      id="working_hours_to"
                      type="time"
                      value={formData.working_hours_to}
                      onChange={(e) => setFormData({...formData, working_hours_to: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="discount_available_from">Скидки с</Label>
                    <Input
                      id="discount_available_from"
                      type="time"
                      value={formData.discount_available_from}
                      onChange={(e) => setFormData({...formData, discount_available_from: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_available_to">Скидки до</Label>
                    <Input
                      id="discount_available_to"
                      type="time"
                      value={formData.discount_available_to}
                      onChange={(e) => setFormData({...formData, discount_available_to: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Активная точка</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowDialog(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {pickupPoints.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            У вас пока нет точек выдачи. Создайте первую точку.
          </p>
        ) : (
          <div className="space-y-4">
            {pickupPoints.map((point) => (
              <div key={point.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{point.name}</h4>
                    <p className="text-sm text-muted-foreground">{point.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={point.is_active ? "default" : "secondary"}>
                      {point.is_active ? 'Активна' : 'Неактивна'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(point)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(point.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {(point.working_hours_from || point.working_hours_to) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Работает: {point.working_hours_from || '00:00'} - {point.working_hours_to || '23:59'}
                  </div>
                )}
                {(point.discount_available_from || point.discount_available_to) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Скидки: {point.discount_available_from || '00:00'} - {point.discount_available_to || '23:59'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PickupPointManagement;