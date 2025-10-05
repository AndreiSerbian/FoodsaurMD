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

    const { preOrderId, orderCode, pickupPointId, totalAmount, itemsCount } = await req.json();

    console.log('Processing pre-order notification:', { preOrderId, orderCode, pickupPointId });

    // Fetch pickup point and producer info
    const { data: pointData, error: pointError } = await supabase
      .from('pickup_points')
      .select(`
        id,
        name,
        address,
        city,
        producer_id,
        producer_profiles!inner(
          id,
          producer_name
        )
      `)
      .eq('id', pickupPointId)
      .single();

    if (pointError) {
      console.error('Error fetching point data:', pointError);
      throw pointError;
    }

    console.log('Point data:', pointData);

    // Fetch producer Telegram settings
    const { data: telegramSettings, error: telegramError } = await supabase
      .from('producer_telegram_settings')
      .select('bot_token, chat_id, is_active')
      .eq('producer_id', pointData.producer_profiles.id)
      .single();

    if (telegramError) {
      console.log('No Telegram settings found for producer:', telegramError);
    }

    // Fetch pre-order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('pre_order_items')
      .select(`
        quantity,
        price_regular,
        price_discount,
        products!inner(
          name,
          price_unit
        )
      `)
      .eq('pre_order_id', preOrderId);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      throw itemsError;
    }

    // Format message
    let message = `🛒 *Новый предзаказ*\n\n`;
    message += `📍 *Точка:* ${pointData.name}\n`;
    message += `📫 *Адрес:* ${pointData.address}, ${pointData.city}\n`;
    message += `🔢 *Код заказа:* \`${orderCode}\`\n\n`;
    message += `*Состав заказа:*\n`;
    
    orderItems?.forEach((item: any) => {
      const price = item.price_discount || item.price_regular;
      message += `• ${item.products.name} - ${item.quantity} ${item.products.price_unit} × ${price} MDL\n`;
    });
    
    message += `\n💰 *Сумма:* ${totalAmount} MDL`;

    // Send to producer's Telegram if configured
    if (telegramSettings && telegramSettings.is_active && telegramSettings.bot_token && telegramSettings.chat_id) {
      console.log('Sending to producer Telegram');
      const telegramUrl = `https://api.telegram.org/bot${telegramSettings.bot_token}/sendMessage`;
      
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramSettings.chat_id,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const telegramResult = await telegramResponse.json();
      console.log('Producer Telegram response:', telegramResult);
    }

    // Also send to admin Telegram as fallback
    const adminBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const adminChatId = Deno.env.get('ADMIN_CHAT_ID');

    if (adminBotToken && adminChatId) {
      console.log('Sending to admin Telegram');
      const adminTelegramUrl = `https://api.telegram.org/bot${adminBotToken}/sendMessage`;
      
      const adminResponse = await fetch(adminTelegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const adminResult = await adminResponse.json();
      console.log('Admin Telegram response:', adminResult);
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
