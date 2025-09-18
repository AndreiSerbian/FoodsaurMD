import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, Plus, Edit, Trash2, MapPin, Clock, Package } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import PointForm from './PointForm';
import PointInventoryManager from './points/PointInventoryManager';

const PickupPointManagement = ({ producerProfile }) => {
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [viewingInventoryPointId, setViewingInventoryPointId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (producerProfile?.id) {
      fetchPickupPoints();
    }
  }, [producerProfile, refreshKey]);

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

  const handleAddPoint = () => {
    setEditingPoint(null);
    setShowAddForm(true);
    setIsOpen(true);
  };

  const handleEditPoint = (point) => {
    setEditingPoint(point);
    setShowAddForm(true);
    setIsOpen(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingPoint(null);
  };

  const handleSavePoint = () => {
    setShowAddForm(false);
    setEditingPoint(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleDeletePoint = async (pointId) => {
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
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting pickup point:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить точку выдачи",
        variant: "destructive"
      });
    }
  };

  const handleViewPoints = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowAddForm(false);
      setEditingPoint(null);
      setViewingInventoryPointId(null);
    }
  };

  const handleViewInventory = (pointId) => {
    setViewingInventoryPointId(pointId);
    setShowAddForm(false);
    setEditingPoint(null);
  };

  const handleCloseInventory = () => {
    setViewingInventoryPointId(null);
  };

  const formatWorkHours = (workHours) => {
    if (!workHours) return 'Не указаны';
    
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayKey = dayKeys[today];
    const todayHours = workHours[todayKey] || [];
    
    if (todayHours.length === 0) {
      return 'Сегодня закрыто';
    }
    
    return `Сегодня: ${todayHours.map(range => `${range.open}-${range.close}`).join(', ')}`;
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
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 text-left">
              <MapPin className="h-5 w-5 text-gray-50" />
              <h3 className="text-lg leading-6 font-medium text-gray-50">
                Управление точками выдачи
              </h3>
              <ChevronDown className={`h-4 w-4 text-gray-50 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleViewPoints} 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
              >
                {isOpen ? 'Скрыть точки' : 'Просмотреть точки'}
              </Button>
              <Button 
                onClick={handleAddPoint} 
                className="bg-green-900 hover:bg-green-800 text-gray-50 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить точку
              </Button>
            </div>
          </div>

          <CollapsibleContent className="space-y-4">
            {pickupPoints.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                У вас пока нет точек выдачи. Создайте первую точку.
              </p>
            ) : (
              <div className="space-y-4">
                {pickupPoints.map(point => (
                  <div key={point.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{point.title || point.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {point.city && `${point.city}, `}{point.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={point.is_active ? "default" : "secondary"}>
                          {point.is_active ? 'Активна' : 'Неактивна'}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleViewInventory(point.id)}>
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditPoint(point)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePoint(point.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatWorkHours(point.work_hours)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddForm && (
              <PointForm 
                point={editingPoint} 
                producerProfile={producerProfile} 
                onSave={handleSavePoint} 
                onCancel={handleCloseForm} 
              />
            )}

            {viewingInventoryPointId && (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium">Остатки товаров в точке</h4>
                  <Button variant="outline" onClick={handleCloseInventory}>
                    Закрыть
                  </Button>
                </div>
                <PointInventoryManager 
                  pointId={viewingInventoryPointId}
                  producerId={producerProfile.id}
                />
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default PickupPointManagement;