import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PointsPublicGrid from '../components/points/PointsPublicGrid';
import { supabase } from '../integrations/supabase/client';

export default function ProducerPoints() {
  const { producerSlug } = useParams();
  const navigate = useNavigate();
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (producerSlug) {
      loadProducer();
    }
  }, [producerSlug]);

  const loadProducer = async () => {
    try {
      const { data, error } = await supabase
        .from('producer_profiles')
        .select('*')
        .eq('slug', producerSlug)
        .single();

      if (error) {
        console.error('Error loading producer:', error);
        navigate('/');
        return;
      }

      setProducer(data);
    } catch (error) {
      console.error('Error loading producer:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePointSelected = (point) => {
    // Navigate to products page with selected point
    navigate(`/producer/${producerSlug}/products?pointId=${point.id}`);
  };

  const handleBackToProducer = () => {
    navigate(`/producer/${producerSlug}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Производитель не найден</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBackToProducer}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к производителю
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Выберите точку выдачи
          </h1>
          <p className="text-lg text-muted-foreground">
            {producer.producer_name}
          </p>
          <p className="text-sm text-muted-foreground">
            Вы можете заказывать товары только из одной точки выдачи
          </p>
        </div>
      </div>

      <PointsPublicGrid 
        producerSlug={producerSlug}
        onPointSelected={handlePointSelected}
      />
    </div>
  );
}