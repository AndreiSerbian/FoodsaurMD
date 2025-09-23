-- Fix the remaining 3 functions that still need SET search_path = public

CREATE OR REPLACE FUNCTION public.rpc_create_preorder_and_decrement(order_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_id UUID;
  _producer_id UUID;
  _point_id UUID;
  _user_id UUID;
  _customer_name TEXT;
  _customer_phone TEXT;
  _customer_email TEXT;
  _pickup_time TIMESTAMPTZ;
  _total_amount NUMERIC(12,2) := 0;
  _item JSONB;
  _product_data RECORD;
  _current_stock BIGINT;
BEGIN
  -- Извлекаем данные из payload
  _user_id := (order_payload->>'user_id')::UUID;
  _producer_id := (order_payload->>'producer_id')::UUID;
  _point_id := (order_payload->>'point_id')::UUID;
  _customer_name := order_payload->>'customer_name';
  _customer_phone := order_payload->>'customer_phone';
  _customer_email := order_payload->>'customer_email';
  _pickup_time := (order_payload->>'pickup_time')::TIMESTAMPTZ;

  -- Проверяем и блокируем остатки для каждого товара
  FOR _item IN SELECT * FROM jsonb_array_elements(order_payload->'items')
  LOOP
    -- Получаем данные товара
    SELECT p.* INTO _product_data
    FROM products p
    WHERE p.id = (_item->>'product_id')::UUID;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND: %', _item->>'product_id';
    END IF;

    -- Проверяем остаток в точке (с блокировкой)
    SELECT bulk_qty INTO _current_stock
    FROM point_inventory
    WHERE point_id = _point_id 
      AND product_id = (_item->>'product_id')::UUID
    FOR UPDATE;

    -- Если записи нет в point_inventory, используем общий остаток товара
    IF NOT FOUND THEN
      _current_stock := _product_data.quantity;
      
      -- Создаем запись в point_inventory если её нет
      INSERT INTO point_inventory (point_id, product_id, bulk_qty)
      VALUES (_point_id, (_item->>'product_id')::UUID, _product_data.quantity);
    END IF;

    -- Проверяем достаточность остатка
    IF _current_stock < (_item->>'qty')::INTEGER THEN
      RAISE EXCEPTION 'OUT_OF_STOCK: Product % has only % items available at this point', 
        _product_data.name, _current_stock;
    END IF;

    -- Вычисляем общую сумму
    _total_amount := _total_amount + ((_item->>'price')::NUMERIC * (_item->>'qty')::INTEGER);
  END LOOP;

  -- Создаем заказ
  INSERT INTO orders (
    user_id, producer_id, point_id, total_amount, 
    customer_name, customer_phone, customer_email, pickup_time,
    status
  ) VALUES (
    _user_id, _producer_id, _point_id, _total_amount,
    _customer_name, _customer_phone, _customer_email, _pickup_time,
    'preorder'
  ) RETURNING id INTO _order_id;

  -- Создаем позиции заказа и списываем остатки
  FOR _item IN SELECT * FROM jsonb_array_elements(order_payload->'items')
  LOOP
    -- Получаем данные товара для snapshot
    SELECT row_to_json(p.*) INTO _product_data
    FROM products p
    WHERE p.id = (_item->>'product_id')::UUID;

    -- Создаем позицию заказа
    INSERT INTO order_items (
      order_id, product_id, qty, price, subtotal, product_snapshot
    ) VALUES (
      _order_id,
      (_item->>'product_id')::UUID,
      (_item->>'qty')::INTEGER,
      (_item->>'price')::NUMERIC,
      ((_item->>'price')::NUMERIC * (_item->>'qty')::INTEGER),
      _product_data::JSONB
    );

    -- Списываем остаток
    UPDATE point_inventory
    SET bulk_qty = bulk_qty - (_item->>'qty')::INTEGER,
        updated_at = now()
    WHERE point_id = _point_id 
      AND product_id = (_item->>'product_id')::UUID;
  END LOOP;

  RETURN jsonb_build_object('order_id', _order_id, 'success', true);
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_cancel_preorder(order_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_record RECORD;
  _item RECORD;
BEGIN
  -- Получаем данные заказа
  SELECT * INTO _order_record
  FROM orders
  WHERE id = order_id_param AND status = 'preorder';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND_OR_NOT_CANCELABLE';
  END IF;

  -- Возвращаем остатки по каждой позиции
  FOR _item IN 
    SELECT product_id, qty 
    FROM order_items 
    WHERE order_id = order_id_param
  LOOP
    -- Возвращаем остаток в point_inventory
    UPDATE point_inventory
    SET bulk_qty = bulk_qty + _item.qty,
        updated_at = now()
    WHERE point_id = _order_record.point_id 
      AND product_id = _item.product_id;

    -- Если записи нет, создаем её
    IF NOT FOUND THEN
      INSERT INTO point_inventory (point_id, product_id, bulk_qty, updated_at)
      VALUES (_order_record.point_id, _item.product_id, _item.qty, now());
    END IF;
  END LOOP;

  -- Обновляем статус заказа
  UPDATE orders
  SET status = 'cancelled', updated_at = now()
  WHERE id = order_id_param;

  RETURN jsonb_build_object('success', true, 'order_id', order_id_param);
END;
$$;

CREATE OR REPLACE FUNCTION public.atomic_inventory_deduction(p_point_id uuid, p_product_id uuid, p_deduct_amount bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_qty BIGINT;
  v_updated_rows INTEGER;
BEGIN
  -- Lock and get current quantity
  SELECT bulk_qty INTO v_current_qty
  FROM public.point_inventory
  WHERE point_id = p_point_id AND product_id = p_product_id
  FOR UPDATE;

  -- Check if record exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PRODUCT_NOT_FOUND',
      'message', 'Product not found in inventory'
    );
  END IF;

  -- Check if enough quantity available
  IF v_current_qty < p_deduct_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_STOCK',
      'message', 'Insufficient stock available',
      'available', v_current_qty,
      'requested', p_deduct_amount
    );
  END IF;

  -- Perform atomic deduction
  UPDATE public.point_inventory
  SET bulk_qty = bulk_qty - p_deduct_amount,
      updated_at = now()
  WHERE point_id = p_point_id 
    AND product_id = p_product_id 
    AND bulk_qty >= p_deduct_amount;
  
  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

  -- Double-check update was successful
  IF v_updated_rows = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONCURRENT_UPDATE',
      'message', 'Stock was modified by another transaction'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deducted', p_deduct_amount,
    'remaining', v_current_qty - p_deduct_amount
  );
END;
$$;