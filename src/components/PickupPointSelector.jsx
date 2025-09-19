import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useCart } from '@/contexts/CartContext';

const PickupPointSelector = ({ producerId, onPointChange, selectedPointId }) => {
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const { clearCart } = useCart();

  useEffect(() => {
    if (!producerId) return;

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

    fetchPickupPoints();
  }, [producerId]);

  const handlePointChange = (pointId) => {
    if (selectedPointId && selectedPointId !== pointId) {
      // Clear cart when changing pickup point
      clearCart();
    }
    onPointChange(pointId);
  };

  if (loading) {
    return <div className="animate-pulse">Загрузка точек выдачи...</div>;
  }

  if (pickupPoints.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          У этого производителя нет активных точек выдачи
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="pickup-point">Выберите точку выдачи</Label>
      <Select value={selectedPointId || ''} onValueChange={handlePointChange}>
        <SelectTrigger>
          <SelectValue placeholder="Выберите точку выдачи для просмотра цен" />
        </SelectTrigger>
        <SelectContent className="z-50 bg-background border shadow-lg">
          {pickupPoints.map(point => (
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