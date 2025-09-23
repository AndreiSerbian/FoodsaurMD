sequenceDiagram
    title Предзаказ с учётом точки, варианта продажи и скидок

    actor User as Покупатель
    participant WebApp as WebApp (Фронтенд)
    participant Supabase as Supabase (БД)
    participant EdgeFn as Edge Function
    participant TelegramAPI as Telegram API
    participant GoogleSheets as Google Sheets
    actor ProducerAdmin as Производитель (Админ)

    %% 1) Выбор точки и загрузка данных витрины
    User->>WebApp: Открыть витрину, выбрать точку выдачи
    WebApp->>Supabase: SELECT products, point_variants, point_inventory, discounts
    Note right of Supabase: 
      Таблицы:<br/>
      • products(id, producer_id, name, price_regular, price_discount, in_stock, ...)<br/>
      • point_variants(point_id, product_id, sale_mode, price_per_pack/kg/unit, price_discount, ...)<br/>
      • point_inventory(point_id, product_id, bulk_qty)<br/>
      • discounts(product_id, discount_percent/amount, start_time, end_time, is_active)
    Supabase-->>WebApp: Данные для отображения (цены, варианты, остатки)

    %% 2) Выбор товара и варианта
    User->>WebApp: Добавить товар (вариант продажи) в корзину
    WebApp->>Supabase: Проверка доступности (point_inventory.bulk_qty)
    Supabase-->>WebApp: ОК / Недостаточно остатка
    WebApp-->>User: Сообщение при превышении лимита (без показа точного остатка)

    %% 3) Создание предзаказа
    User->>WebApp: Оформить предзаказ (pickup_time)
    WebApp->>Supabase: INSERT pre_orders(status='created', pickup_point_id, total_amount, discount_amount, pickup_time)
    WebApp->>Supabase: INSERT pre_order_items(pre_order_id, product_id, quantity, price_regular, price_discount)

    %% 4) Валидация сервером
    WebApp->>EdgeFn: Валидация цен/скидок/остатков
    EdgeFn->>Supabase: SELECT point_variants, discounts, point_inventory
    Supabase-->>EdgeFn: Актуальные данные
    EdgeFn-->>WebApp: OK / Ошибка (рассинхронизация) -> предложить обновить корзину

    %% 5) Подтверждение и создание заказа
    User->>WebApp: Подтвердить заказ
    WebApp->>Supabase: INSERT orders(status='preorder', producer_id, point_id, total_amount, customer_*)
    WebApp->>Supabase: INSERT order_items(order_id, product_id, qty, price, subtotal, product_snapshot)

    %% 5a) Побочные эффекты Edge Function
    WebApp->>EdgeFn: Пост-обработка (уменьшение остатков, уведомления)
    EdgeFn->>Supabase: UPDATE point_inventory SET bulk_qty = bulk_qty - qty
    EdgeFn->>Supabase: SELECT producer_telegram_settings(bot_token, chat_id)
    EdgeFn->>TelegramAPI: Отправить уведомление о заказе
    EdgeFn->>GoogleSheets: Апдейт/дублирование заказа (опционально)
    EdgeFn-->>WebApp: Готово

    %% 6) Подтверждение готовности и выдача
    ProducerAdmin->>Supabase: UPDATE orders SET status='confirmed'/'ready'
    Note right of Supabase: orders.status: created → preorder/pending → confirmed/ready → delivered/canceled
    User->>ProducerAdmin: Забирает заказ (в окно pickup_time)
    ProducerAdmin->>Supabase: UPDATE orders SET status='delivered'