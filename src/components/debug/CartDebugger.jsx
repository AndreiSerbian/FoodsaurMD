import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { getCart, getSelectedPoint } from '@/modules/cart/cartState';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';

const CartDebugger = () => {
  const { cartItems, selectedPointInfo, cartTotal } = useCart();
  const [cartState, setCartState] = useState({});
  const [issues, setIssues] = useState([]);

  const refreshCartState = () => {
    const cart = getCart();
    const point = getSelectedPoint();
    setCartState({ cart, point });
    
    // Проверка проблем
    const foundIssues = [];
    
    // Проверка структуры корзины
    if (!cart.items || !Array.isArray(cart.items)) {
      foundIssues.push({
        type: 'structure',
        message: 'Неверная структура корзины - отсутствует массив items'
      });
    }
    
    // Проверка товаров в корзине
    if (cart.items && Array.isArray(cart.items)) {
      cart.items.forEach((item, index) => {
        if (!item.id && !item.productId) {
          foundIssues.push({
            type: 'item',
            message: `Товар ${index + 1}: отсутствует ID товара`
          });
        }
        
        if (!item.name) {
          foundIssues.push({
            type: 'item',
            message: `Товар ${index + 1}: отсутствует название товара`
          });
        }
        
        if (!item.price || item.price <= 0) {
          foundIssues.push({
            type: 'item',
            message: `Товар ${index + 1}: неверная цена (${item.price})`
          });
        }
        
        if (!item.qty || item.qty <= 0) {
          foundIssues.push({
            type: 'item',
            message: `Товар ${index + 1}: неверное количество (${item.qty})`
          });
        }
      });
    }
    
    // Проверка соответствия между контекстом и localStorage
    if (cartItems.length !== (cart.items?.length || 0)) {
      foundIssues.push({
        type: 'sync',
        message: `Несоответствие количества товаров: контекст (${cartItems.length}) vs localStorage (${cart.items?.length || 0})`
      });
    }
    
    // Проверка выбранной точки
    if (cartItems.length > 0 && !point) {
      foundIssues.push({
        type: 'point',
        message: 'В корзине есть товары, но не выбрана точка выдачи'
      });
    }
    
    setIssues(foundIssues);
  };

  useEffect(() => {
    refreshCartState();
  }, [cartItems, selectedPointInfo]);

  const clearCartCompletely = () => {
    localStorage.removeItem('fs_cart_v1');
    localStorage.removeItem('fs_cart_producer_lock_v1');
    localStorage.removeItem('fs_cart_point_v1');
    window.dispatchEvent(new CustomEvent('cartChanged', { detail: { items: [] } }));
    window.dispatchEvent(new CustomEvent('selectedPointChanged', { detail: null }));
    refreshCartState();
  };

  const issuesByType = issues.reduce((acc, issue) => {
    if (!acc[issue.type]) acc[issue.type] = [];
    acc[issue.type].push(issue);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Отладка корзины
        </h3>
        <div className="flex gap-2">
          <Button onClick={refreshCartState} variant="outline" size="sm">
            Обновить
          </Button>
          <Button onClick={clearCartCompletely} variant="destructive" size="sm">
            Очистить полностью
          </Button>
        </div>
      </div>

      {/* Статус корзины */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {issues.length === 0 ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                Корзина работает корректно
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Обнаружены проблемы
              </>
            )}
            <Badge variant={issues.length === 0 ? "default" : "destructive"}>
              {issues.length} проблем
            </Badge>
          </CardTitle>
        </CardHeader>
        {issues.length > 0 && (
          <CardContent>
            <div className="space-y-2">
              {Object.entries(issuesByType).map(([type, typeIssues]) => (
                <div key={type}>
                  <h4 className="font-medium text-sm capitalize mb-1">
                    {type === 'structure' && 'Структура данных'}
                    {type === 'item' && 'Товары'}
                    {type === 'sync' && 'Синхронизация'}
                    {type === 'point' && 'Точка выдачи'}
                  </h4>
                  {typeIssues.map((issue, index) => (
                    <Alert key={index} variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">
                        {issue.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Данные корзины */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Контекст React</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div><strong>Количество товаров:</strong> {cartItems.length}</div>
              <div><strong>Общая сумма:</strong> {cartTotal} лей</div>
              <div><strong>Выбранная точка:</strong> {selectedPointInfo?.pointName || 'не выбрана'}</div>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify({ cartItems, selectedPointInfo, cartTotal }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>localStorage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div><strong>Количество товаров:</strong> {cartState.cart?.items?.length || 0}</div>
              <div><strong>Выбранная точка:</strong> {cartState.point?.pointName || 'не выбрана'}</div>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(cartState, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartDebugger;