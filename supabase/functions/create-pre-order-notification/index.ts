import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { preOrderId, orderCode, pickupPointId, totalAmount, itemsCount } = await req.json();

    console.log('Processing pre-order notification:', { preOrderId, orderCode, pickupPointId });

    // Get pickup point and producer info
    const { data: pickupPoint, error: pointError } = await supabaseClient
      .from('pickup_points')
      .select(`
        *,
        producer_profiles!inner(
          id,
          producer_name,
          user_id
        )
      `)
      .eq('id', pickupPointId)
      .single();

    if (pointError || !pickupPoint) {
      console.error('Error fetching pickup point:', pointError);
      throw new Error('Pickup point not found');
    }

    // Get producer's telegram settings
    const { data: telegramSettings } = await supabaseClient
      .from('producer_telegram_settings')
      .select('bot_token, chat_id, is_active')
      .eq('producer_id', pickupPoint.producer_profiles.id)
      .eq('is_active', true)
      .single();

    // Get order items details
    const { data: orderItems } = await supabaseClient
      .from('pre_order_items')
      .select(`
        quantity,
        products!inner(name)
      `)
      .eq('pre_order_id', preOrderId);

    const itemsList = orderItems?.map(item => 
      `• ${item.products.name} x${item.quantity}`
    ).join('\n') || '';

    const message = `
🛒 НОВЫЙ ПРЕДЗАКАЗ

📍 Точка: ${pickupPoint.name}
📍 Адрес: ${pickupPoint.address}
🔢 Код заказа: ${orderCode}
💰 Сумма: ${totalAmount} лей
📦 Товаров: ${itemsCount}

СОСТАВ ЗАКАЗА:
${itemsList}

Ожидайте клиента для получения заказа.`;

    // Send telegram notification if configured
    if (telegramSettings?.bot_token && telegramSettings?.chat_id) {
      try {
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${telegramSettings.bot_token}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: telegramSettings.chat_id,
              text: message,
              parse_mode: 'HTML'
            })
          }
        );

        if (!telegramResponse.ok) {
          console.error('Telegram notification failed:', await telegramResponse.text());
        } else {
          console.log('Telegram notification sent successfully');
        }
      } catch (telegramError) {
        console.error('Error sending telegram notification:', telegramError);
      }
    }

    // Send fallback notification to admin
    const adminChatId = Deno.env.get('ADMIN_CHAT_ID');
    const adminBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

    if (adminBotToken && adminChatId) {
      try {
        const adminMessage = `
🆕 НОВЫЙ ПРЕДЗАКАЗ (Производитель: ${pickupPoint.producer_profiles.producer_name})

📍 Точка: ${pickupPoint.name}
📍 Адрес: ${pickupPoint.address}
🔢 Код заказа: ${orderCode}
💰 Сумма: ${totalAmount} лей
📦 Товаров: ${itemsCount}

СОСТАВ ЗАКАЗА:
${itemsList}`;

        await fetch(
          `https://api.telegram.org/bot${adminBotToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: adminChatId,
              text: adminMessage,
              parse_mode: 'HTML'
            })
          }
        );
        
        console.log('Admin notification sent');
      } catch (adminError) {
        console.error('Error sending admin notification:', adminError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent',
        orderCode 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in pre-order notification:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});