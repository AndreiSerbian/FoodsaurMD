import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PickupPoint {
  id: string;
  name: string;
  title?: string | null;
  address: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
  is_active: boolean;
  producer_id?: string;
  work_hours?: any;
  slug?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface PickupPointsMapProps {
  points: PickupPoint[];
  onPointClick?: (point: PickupPoint) => void;
  selectedPointId?: string;
  className?: string;
  height?: string;
}

// Component to fit bounds to all markers
function FitBounds({ points }: { points: PickupPoint[] }) {
  const map = useMap();

  useEffect(() => {
    const validPoints = points.filter(p => p.lat && p.lng);
    if (validPoints.length === 0) return;

    if (validPoints.length === 1) {
      map.setView([validPoints[0].lat!, validPoints[0].lng!], 15);
    } else {
      const bounds = L.latLngBounds(
        validPoints.map(p => [p.lat!, p.lng!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
}

export default function PickupPointsMap({ 
  points, 
  onPointClick, 
  selectedPointId,
  className = '',
  height = '400px'
}: PickupPointsMapProps) {
  const validPoints = points.filter(p => p.lat !== null && p.lng !== null);
  
  // Default center (Moldova/Chisinau area)
  const defaultCenter: [number, number] = [47.0105, 28.8638];
  const defaultZoom = 12;

  if (validPoints.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-muted-foreground">
          Нет точек с координатами для отображения на карте
        </p>
      </div>
    );
  }

  const center: [number, number] = validPoints.length > 0 
    ? [validPoints[0].lat!, validPoints[0].lng!]
    : defaultCenter;

  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={validPoints} />
        
        {validPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat!, point.lng!]}
            eventHandlers={{
              click: () => onPointClick?.(point)
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-sm">
                  {point.title || point.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {point.address}, {point.city}
                </p>
                {!point.is_active && (
                  <span className="text-xs text-red-500 mt-1 block">
                    Неактивна
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
