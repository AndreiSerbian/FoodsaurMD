import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const Products = () => {
  const { producerSlug } = useParams();

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            to={`/producer/${producerSlug}/points`} 
            className="inline-flex items-center text-green-600 hover:text-primary transition duration-200"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Назад к выбору точки
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Продукты для {producerSlug}</h1>
          <p className="text-muted-foreground">
            Страница временно упрощена для диагностики проблем с загрузкой.
          </p>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Если вы видите эту страницу, значит роутинг работает правильно.
              Проблема может быть в компонентах или контексте.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;