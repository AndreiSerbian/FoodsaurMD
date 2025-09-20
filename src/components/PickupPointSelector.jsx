import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { useNewCart } from '@/contexts/NewCartContext';
import { supabase } from '@/integrations/supabase/client';

const PickupPointSelector = ({ producerId }) => {
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const { selectedPointId, changePickupPoint } = useNewCart();

  useEffect(() => {
    if (producerId) {
      fetchPickupPoints();
    }
  }, [producerId]);

  const fetchPickupPoints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('producer_id', producerId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPickupPoints(data || []);
    } catch (error) {
      console.error('Error fetching pickup points:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePointChange = (pointId) => {
    changePickupPoint(pointId);
  };

  if (loading) {
    return <div>Загрузка точек выдачи...</div>;
  }

  if (pickupPoints.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          У данного производителя нет активных точек выдачи
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Выберите точку выдачи:</label>
      <Select value={selectedPointId || ''} onValueChange={handlePointChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите точку выдачи" />
        </SelectTrigger>
        <SelectContent>
          {pickupPoints.map((point) => (
            <SelectItem key={point.id} value={point.id}>
              <div>
                <div className="font-medium">{point.name}</div>
                <div className="text-sm text-muted-foreground">{point.address}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PickupPointSelector;