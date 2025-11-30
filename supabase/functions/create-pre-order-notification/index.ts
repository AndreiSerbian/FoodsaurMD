import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { orderId, orderCode, pickupPointId, pickupTime, totalAmount, totalSavings, items } = await req.json();

    console.log('Processing order notification:', { orderId, orderCode, pickupPointId });

    // Fetch pickup point info
    const { data: pointData, error: pointError } = await supabase
      .from('pickup_points')
      .select('id, name, address, city, producer_id')
      .eq('id', pickupPointId)
      .single();

    if (pointError) {
      console.error('Error fetching point data:', pointError);
      throw pointError;
    }

    console.log('Point data:', pointData);

    // Fetch order details
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('created_at, pickup_time')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order data:', orderError);
    }

    // Format dates
    const orderDate = orderData?.created_at ? new Date(orderData.created_at).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';

    const pickupDate = orderData?.pickup_time ? new Date(orderData.pickup_time).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : pickupTime;

    // Format message
    let message = `🛒 *Новый заказ*\n\n`;
    message += `🔢 *Код заказа:* \`${orderCode}\`\n`;
    message += `📍 *Точка:* ${pointData.name}\n`;
    message += `📫 *Адрес:* ${pointData.address}, ${pointData.city}\n\n`;
    message += `📅 *Дата заказа:* ${orderDate}\n`;
    message += `⏰ *Время получения:* ${pickupDate}\n\n`;
    message += `*Состав заказа:*\n`;
    
    items?.forEach((item: any) => {
      message += `• ${item.name} - ${item.quantity} ${item.unit} × ${item.price} MDL\n`;
    });
    
    message += `\n💰 *Сумма:* ${totalAmount} MDL`;
    if (parseFloat(totalSavings) > 0) {
      message += `\n💚 *Скидка:* ${totalSavings} MDL`;
    }

    // Send to admin Telegram
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

    // Send to point Telegram (if configured)
    const { data: pointTelegramSettings, error: telegramError } = await supabase
      .from('point_telegram_settings')
      .select('bot_token, chat_id, is_active')
      .eq('point_id', pickupPointId)
      .single();

    if (telegramError) {
      console.log('No Telegram settings for point:', telegramError.message);
    } else if (pointTelegramSettings?.is_active && pointTelegramSettings?.bot_token && pointTelegramSettings?.chat_id) {
      console.log('Sending to point Telegram');
      const pointTelegramUrl = `https://api.telegram.org/bot${pointTelegramSettings.bot_token}/sendMessage`;
      
      const pointTelegramResponse = await fetch(pointTelegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: pointTelegramSettings.chat_id,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const pointTelegramResult = await pointTelegramResponse.json();
      console.log('Point Telegram response:', pointTelegramResult);

      if (!pointTelegramResult.ok) {
        console.error('Failed to send to point Telegram:', pointTelegramResult);
      }
    } else {
      console.log('Point Telegram not configured or inactive');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in create-pre-order-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
