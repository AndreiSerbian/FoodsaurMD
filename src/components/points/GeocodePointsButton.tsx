import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface GeocodeResult {
  id: string;
  name: string;
  status: 'success' | 'not_found' | 'error';
  lat?: number;
  lng?: number;
  error?: string;
}

interface GeocodeButtonProps {
  producerId?: string;
  onComplete?: () => void;
}

export default function GeocodePointsButton({ producerId, onComplete }: GeocodeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    processed: number;
    updated: number;
    failed: number;
    details: GeocodeResult[];
  } | null>(null);
  const { toast } = useToast();

  const handleGeocode = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('geocode-points', {
        body: { producerId, dryRun: false }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResults(response.data);
      setShowResults(true);

      if (response.data.updated > 0) {
        toast({
          title: 'Геокодирование завершено',
          description: `Обновлено ${response.data.updated} из ${response.data.processed} точек`,
        });
        onComplete?.();
      } else if (response.data.processed === 0) {
        toast({
          title: 'Нет точек для обработки',
          description: 'Все точки уже имеют координаты',
        });
      } else {
        toast({
          title: 'Геокодирование завершено',
          description: 'Не удалось найти координаты для указанных адресов',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить геокодирование',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleGeocode}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        {loading ? 'Геокодирование...' : 'Найти координаты'}
      </Button>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Результаты геокодирования</DialogTitle>
            <DialogDescription>
              Обработано {results?.processed || 0} точек, 
              обновлено {results?.updated || 0}, 
              ошибок {results?.failed || 0}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {results?.details.map((detail) => (
                <div 
                  key={detail.id} 
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{detail.name}</p>
                    {detail.status === 'success' && detail.lat && detail.lng && (
                      <p className="text-xs text-muted-foreground">
                        {detail.lat.toFixed(4)}, {detail.lng.toFixed(4)}
                      </p>
                    )}
                    {detail.error && (
                      <p className="text-xs text-destructive">{detail.error}</p>
                    )}
                  </div>
                  <Badge 
                    variant={detail.status === 'success' ? 'default' : 'destructive'}
                    className="ml-2"
                  >
                    {detail.status === 'success' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={() => setShowResults(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
