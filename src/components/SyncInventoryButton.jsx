import React, { useState } from 'react';
import { Button } from './ui/button';
import { RefreshCw, Package } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { syncProductsToPoint } from '../modules/inventory/inventorySync';

const SyncInventoryButton = ({ pointId, producerId, onSyncComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    if (!pointId || !producerId) {
      toast({
        title: "Ошибка",
        description: "Не указан ID точки или производителя",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await syncProductsToPoint(pointId, producerId);
      
      toast({
        title: "Успешно синхронизировано",
        description: `Синхронизировано ${result.synced} товаров`,
      });

      if (onSyncComplete) {
        onSyncComplete(result);
      }
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      toast({
        title: "Ошибка синхронизации",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Package className="h-4 w-4" />
      )}
      {isLoading ? 'Синхронизация...' : 'Синхронизировать остатки'}
    </Button>
  );
};

export default SyncInventoryButton;