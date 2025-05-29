
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ProducerWithProducts } from '../hooks/useProducersWithProducts';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ProducerMapProps {
  producer: ProducerWithProducts;
}

const ProducerMap: React.FC<ProducerMapProps> = ({ producer }) => {
  const [coordinates, setCoordinates] = useState<LatLngExpression | null>(null);

  useEffect(() => {
    if (!producer?.address) {
      console.log('No producer or address provided to map');
      return;
    }

    // For demo purposes, generate coordinates based on address
    // In real app, you'd geocode the address
    const getCoordinatesFromAddress = (address: string): LatLngExpression => {
      // Mock coordinates around Chisinau area
      const baseCoords: [number, number] = [47.0105, 28.8638];
      const randomOffset = () => (Math.random() - 0.5) * 0.05;
      
      return [
        baseCoords[0] + randomOffset(),
        baseCoords[1] + randomOffset()
      ];
    };

    try {
      const coords = getCoordinatesFromAddress(producer.address);
      console.log('Generated coordinates for producer:', producer.producer_name, coords);
      setCoordinates(coords);
    } catch (error) {
      console.error('Error generating coordinates:', error);
    }
  }, [producer]);

  if (!coordinates || !producer) {
    console.log('Map not rendering - missing coordinates or producer');
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 text-green-900">Местоположение</h3>
      <div className="h-64 rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={coordinates}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={coordinates}>
            <Popup>
              <div className="p-2">
                <h4 className="font-bold text-lg">{producer.producer_name || 'Производитель'}</h4>
                <p className="text-sm text-gray-600">{producer.address || 'Адрес не указан'}</p>
                {producer.phone && (
                  <p className="text-sm text-gray-600">
                    <strong>Телефон:</strong> {producer.phone}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default ProducerMap;
