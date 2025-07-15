import React from 'react';
import OrderSearch from '../components/OrderSearch';

const OrderSearchPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Поиск заказа
          </h1>
          <p className="text-gray-600">
            Введите код заказа для отслеживания статуса
          </p>
        </div>
        <OrderSearch />
      </div>
    </div>
  );
};

export default OrderSearchPage;