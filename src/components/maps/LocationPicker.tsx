import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { geocodeAddress } from '@/utils/geocoding';
import { useToast } from '@/hooks/use-toast';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  lat?: number | null;
  lng?: number | null;
  address?: string;
  city?: string;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to recenter map
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16);
    }
  }, [lat, lng, map]);
  
  return null;
}

export default function LocationPicker({
  lat,
  lng,
  address,
  city,
  onLocationChange,
  height = '300px'
}: LocationPickerProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  );
  const { toast } = useToast();

  // Default center (Moldova/Chisinau)
  const defaultCenter: [number, number] = [47.0105, 28.8638];
  const center = position || defaultCenter;

  const handleMapClick = useCallback((newLat: number, newLng: number) => {
    setPosition([newLat, newLng]);
    onLocationChange(newLat, newLng);
  }, [onLocationChange]);

  const handleGeocodeAddress = async () => {
    if (!address) {
      toast({
        title: 'Ошибка',
        description: 'Сначала введите адрес',
        variant: 'destructive',
      });
      return;
    }

    setIsGeocoding(true);
    try {
      const result = await geocodeAddress(address, city);
      
      if (result) {
        setPosition([result.lat, result.lng]);
        onLocationChange(result.lat, result.lng);
        toast({
          title: 'Координаты найдены',
          description: `${result.displayName.slice(0, 50)}...`,
        });
      } else {
        toast({
          title: 'Адрес не найден',
          description: 'Попробуйте уточнить адрес или укажите точку на карте вручную',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка геокодинга',
        description: 'Не удалось определить координаты',
        variant: 'destructive',
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  // Update position when props change
  React.useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGeocodeAddress}
          disabled={isGeocoding || !address}
          className="gap-2"
        >
          {isGeocoding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Найти по адресу
        </Button>
        {position && (
          <span className="text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 inline mr-1" />
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </span>
        )}
      </div>
      
      <div className="rounded-lg overflow-hidden border" style={{ height }}>
        <MapContainer
          center={center}
          zoom={position ? 16 : 12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {position && (
            <>
              <Marker position={position} />
              <MapRecenter lat={position[0]} lng={position[1]} />
            </>
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Кликните на карте для выбора точки или используйте кнопку "Найти по адресу"
      </p>
    </div>
  );
}
