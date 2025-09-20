import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown, ChevronRight, Database, AlertTriangle } from 'lucide-react';

const DataDebugPanel = ({ producerSlug, pointId }) => {
  const [debugData, setDebugData] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const fetchDebugData = async () => {
    setLoading(true);
    const data = {};
    
    try {
      // Producer data
      if (producerSlug) {
        const { data: producer, error: producerError } = await supabase
          .from('producer_profiles')
          .select('*')
          .eq('slug', producerSlug)
          .single();
        
        data.producer = { data: producer, error: producerError };
        
        if (producer) {
          // Global catalog
          const { data: catalog, error: catalogError } = await supabase
            .from('products')
            .select('*')
            .eq('producer_id', producer.id)
            .eq('is_active', true);
          
          data.catalog = { data: catalog, error: catalogError };
          
          // Pickup points
          const { data: points, error: pointsError } = await supabase
            .from('pickup_points')
            .select('*')
            .eq('producer_id', producer.id)
            .eq('is_active', true);
          
          data.points = { data: points, error: pointsError };
        }
      }

      // Point-specific data
      if (pointId) {
        // Point products (new structure)
        const { data: pointProducts, error: pointProductsError } = await supabase
          .from('point_products')
          .select(`
            *,
            products (
              id,
              name,
              description,
              unit_type
            )
          `)
          .eq('point_id', pointId)
          .eq('is_active', true);
        
        data.pointProducts = { data: pointProducts, error: pointProductsError };
        
        // Legacy pickup point products
        const { data: legacyProducts, error: legacyError } = await supabase
          .from('pickup_point_products')
          .select('*')
          .eq('pickup_point_id', pointId)
          .eq('is_available', true);
        
        data.legacyProducts = { data: legacyProducts, error: legacyError };
        
        // Point inventory
        const { data: inventory, error: inventoryError } = await supabase
          .from('point_inventory')
          .select('*')
          .eq('point_id', pointId)
          .eq('is_listed', true);
        
        data.inventory = { data: inventory, error: inventoryError };
      }

      setDebugData(data);
    } catch (error) {
      console.error('Debug fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (producerSlug || pointId) {
      fetchDebugData();
    }
  }, [producerSlug, pointId]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderDataSection = (title, sectionData, sectionKey) => {
    if (!sectionData) return null;
    
    const { data, error } = sectionData;
    const hasError = !!error;
    const hasData = data && (Array.isArray(data) ? data.length > 0 : true);
    const dataCount = Array.isArray(data) ? data.length : data ? 1 : 0;
    
    return (
      <Card key={sectionKey} className="mb-4">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {expandedSections[sectionKey] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <Database className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <Badge variant={hasError ? "destructive" : hasData ? "default" : "secondary"}>
                    {hasError ? "Error" : `${dataCount} записей`}
                  </Badge>
                </div>
                {hasError && <AlertTriangle className="w-5 h-5 text-destructive" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {hasError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    <strong>Ошибка:</strong> {error.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {hasData ? (
                <div className="space-y-2">
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Данные отсутствуют
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Панель отладки данных</h2>
        <Button 
          onClick={fetchDebugData} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Загрузка...' : 'Обновить'}
        </Button>
      </div>

      <div className="grid gap-4">
        {renderDataSection('Профиль производителя', debugData.producer, 'producer')}
        {renderDataSection('Глобальный каталог', debugData.catalog, 'catalog')}
        {renderDataSection('Точки выдачи', debugData.points, 'points')}
        {renderDataSection('Товары в точке (новая структура)', debugData.pointProducts, 'pointProducts')}
        {renderDataSection('Товары в точке (старая структура)', debugData.legacyProducts, 'legacyProducts')}
        {renderDataSection('Инвентарь точки', debugData.inventory, 'inventory')}
      </div>

      {(!producerSlug && !pointId) && (
        <Alert>
          <AlertDescription>
            Укажите producerSlug или pointId для отладки данных
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DataDebugPanel;