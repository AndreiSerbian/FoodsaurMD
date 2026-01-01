import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const statusLabels: Record<string, string> = {
  'preorder': '📋 Предзаказ',
  'confirmed': '✅ Подтвержден',
  'ready': '🎁 Готов к выдаче',
  'completed': '✔️ Завершен',
  'cancelled': '❌ Отменен'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { orderId, newStatus, oldStatus } = await req.json();

    console.log('Processing status change notification:', { orderId, oldStatus, newStatus });

    // Fetch order with related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_code,
        total_amount,
        currency,
        customer_name,
        customer_phone,
        pickup_time,
        point_id,
        producer_id,
        pickup_points!fk_orders_point_id(id, name, address, city),
        order_items!fk_order_items_order_id(
          qty,
          price,
          subtotal,
          product_snapshot
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw orderError;
    }

    console.log('Order data:', order);

    // Format pickup time
    const pickupDate = order.pickup_time 
      ? new Date(order.pickup_time).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) 
      : 'Не указано';

    // Build message
    const oldStatusLabel = statusLabels[oldStatus] || oldStatus;
    const newStatusLabel = statusLabels[newStatus] || newStatus;
    
    let message = `🔄 *Изменение статуса заказа*\n\n`;
    message += `🔢 *Код заказа:* \`${order.order_code || order.id.slice(0, 8)}\`\n`;
    message += `📍 *Точка:* ${order.pickup_points?.name || 'N/A'}\n`;
    message += `📫 *Адрес:* ${order.pickup_points?.address || ''}, ${order.pickup_points?.city || ''}\n\n`;
    message += `📊 *Статус:* ${oldStatusLabel} → ${newStatusLabel}\n\n`;
    
    if (order.customer_name) {
      message += `👤 *Клиент:* ${order.customer_name}\n`;
    }
    if (order.customer_phone) {
      message += `📱 *Телефон:* ${order.customer_phone}\n`;
    }
    message += `⏰ *Время получения:* ${pickupDate}\n`;
    message += `💰 *Сумма:* ${order.total_amount} ${order.currency}\n\n`;

    message += `*Состав заказа:*\n`;
    order.order_items?.forEach((item: any) => {
      const productName = item.product_snapshot?.name || 'Товар';
      message += `• ${productName} × ${item.qty} = ${item.subtotal} ${order.currency}\n`;
    });

    // Send to admin
    const adminBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const adminChatId = Deno.env.get('ADMIN_CHAT_ID');

    if (adminBotToken && adminChatId) {
      console.log('Sending to admin Telegram');
      const telegramUrl = `https://api.telegram.org/bot${adminBotToken}/sendMessage`;
      
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const telegramResult = await telegramResponse.json();
      console.log('Admin Telegram response:', telegramResult);
    }

    // Send to point Telegram if configured
    if (order.point_id) {
      const { data: pointTelegramSettings } = await supabase
        .from('point_telegram_settings')
        .select('bot_token, chat_id, is_active')
        .eq('point_id', order.point_id)
        .single();

      if (pointTelegramSettings?.is_active && pointTelegramSettings?.bot_token && pointTelegramSettings?.chat_id) {
        console.log('Sending to point Telegram');
        const pointTelegramUrl = `https://api.telegram.org/bot${pointTelegramSettings.bot_token}/sendMessage`;
        
        await fetch(pointTelegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: pointTelegramSettings.chat_id,
            text: message,
            parse_mode: 'Markdown'
          })
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Status notification sent' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in order-status-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
