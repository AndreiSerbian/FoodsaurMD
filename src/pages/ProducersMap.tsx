
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Tables } from '@/integrations/supabase/types';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ProducerWithCoords extends Tables<'producer_profiles'> {
  lat: number;
  lng: number;
}

const ProducersMap = () => {
  const [producers, setProducers] = useState<ProducerWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchProducers();
  }, []);

  const fetchProducers = async () => {
    try {
      const { data, error } = await supabase
        .from('producer_profiles')
        .select('*')
        .not('address', 'is', null);

      if (error) {
        console.error('Error fetching producers:', error);
        return;
      }

      // For demo purposes, we'll add some mock coordinates
      // In real app, you'd geocode the addresses
      const producersWithCoords: ProducerWithCoords[] = data?.map((producer) => ({
        ...producer,
        lat: 47.0105 + (Math.random() - 0.5) * 0.1, // Chisinau area
        lng: 28.8638 + (Math.random() - 0.5) * 0.1,
      })) || [];

      setProducers(producersWithCoords);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">{t('producersMap')}</h1>
        
        <div className="h-96 md:h-[600px] rounded-lg overflow-hidden shadow-lg">
          <MapContainer
            center={[47.0105, 28.8638]} // Chisinau coordinates
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {producers.map((producer) => (
              <Marker
                key={producer.id}
                position={[producer.lat, producer.lng]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg">{producer.producer_name}</h3>
                    {producer.phone && (
                      <p className="text-sm text-gray-600">
                        <strong>{t('phone')}:</strong> {producer.phone}
                      </p>
                    )}
                    {producer.address && (
                      <p className="text-sm text-gray-600">
                        <strong>{t('address')}:</strong> {producer.address}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default ProducersMap;
