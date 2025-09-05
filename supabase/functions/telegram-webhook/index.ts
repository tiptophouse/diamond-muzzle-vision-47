
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const backendUrl = Deno.env.get('BACKEND_URL');
const backendAccessToken = Deno.env.get('BACKEND_ACCESS_TOKEN');
const b2bGroupId = Deno.env.get('B2B_GROUP_ID');
const telegramWebhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');
const allowedTelegramIPs = [
  '149.154.160.0/20',
  '91.108.4.0/22'
]; // Telegram's official IP ranges

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
    };
    date: number;
    text?: string;
  };
}

interface DiamondRequest {
  shape?: string;
  carat_min?: number;
  carat_max?: number;
  color?: string;
  clarity?: string;
  price_max?: number;
  keywords: string[];
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Security: Verify request authenticity
  const securityCheck = await verifyTelegramRequest(req);
  if (!securityCheck.valid) {
    console.error('❌ Security check failed:', securityCheck.reason);
    return new Response('Unauthorized', { 
      status: 401, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('📱 Telegram webhook called');
    
    const update: TelegramUpdate = await req.json();
    console.log('📱 Received update:', JSON.stringify(update, null, 2));

    if (!update.message?.text || !update.message?.chat) {
      console.log('📱 No text message or chat info, skipping');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const message = update.message;
    const chatId = message.chat.id.toString();

    // Handle private '/start' deep-link clicks to track CTA
    if (message.chat.type === 'private' && message.text?.startsWith('/start')) {
      const parts = message.text.split(' ');
      const startParam = parts[1] || '';
      
      // Handle SFTP setup requests
      if (startParam === 'provide_sftp') {
        await handleSFTPSetupRequest(message.from);
        return new Response('OK', { status: 200, headers: corsHeaders });
      }
      
      const { error: insertError } = await supabase
        .from('group_cta_clicks')
        .insert([{
          telegram_id: message.from.id,
          start_parameter: startParam || 'start',
          source_group_id: null,
          user_agent: 'TelegramBot'
        }]);
      if (insertError) {
        console.error('❌ Error inserting CTA click:', insertError);
      } else {
        console.log('✅ Tracked CTA click from start parameter:', startParam);
      }
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Handle direct SFTP command in private chats
    if (message.chat.type === 'private' && message.text?.toLowerCase().includes('/provide_sftp')) {
      await handleSFTPSetupRequest(message.from);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }
    
    // Only process messages from the B2B group
    if (b2bGroupId && chatId !== b2bGroupId) {
      console.log('📱 Message not from target B2B group, skipping');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    console.log('📱 Processing message from B2B group:', message.text);

    // Save incoming message to chatbot_messages table
    await saveIncomingMessage(message);

    // Check for payment confirmation message
    if (message.text.includes('✅ Payment for post in group confirmed')) {
      console.log('💎 Payment confirmation detected, generating diamond post');
      await generateDiamondPostFromPayment(message);
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Parse diamond request from message
    const diamondRequest = parseDiamondRequest(message.text);
    
    if (diamondRequest.confidence < 0.3) {
      console.log('📱 Low confidence diamond request, skipping');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    console.log('📱 Parsed diamond request:', diamondRequest);

    // Find matching diamonds from all dealers
    const matches = await findMatchingDiamonds(diamondRequest);
    
    if (matches.length === 0) {
      console.log('📱 No matching diamonds found');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    console.log(`📱 Found ${matches.length} matching diamonds`);

    // Create notifications for dealers with matching inventory
    for (const match of matches) {
      await createGroupNotification({
        telegram_id: match.dealer_telegram_id,
        message_type: 'group_diamond_request',
        message_content: `💎 New diamond request in B2B group: ${message.text}`,
        metadata: {
          original_message: message.text,
          requester: message.from,
          group_chat_id: chatId,
          group_title: message.chat.title,
          matching_diamonds: match.diamonds,
          confidence_score: diamondRequest.confidence,
          request_details: diamondRequest,
          message_timestamp: new Date(message.date * 1000).toISOString()
        }
      });
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    return new Response('Error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

function parseDiamondRequest(text: string): DiamondRequest {
  const lowerText = text.toLowerCase();
  
  // Diamond shape detection
  const shapes = ['round', 'princess', 'cushion', 'emerald', 'oval', 'radiant', 'asscher', 'marquise', 'heart', 'pear'];
  const foundShape = shapes.find(shape => lowerText.includes(shape));
  
  // Carat weight detection
  const caratMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:ct|carat|carats)/);
  const caratRangeMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*[-to]\s*(\d+(?:\.\d+)?)\s*(?:ct|carat|carats)/);
  
  // Color detection
  const colors = ['d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
  const foundColor = colors.find(color => lowerText.includes(` ${color} `) || lowerText.includes(`${color}+`));
  
  // Clarity detection
  const clarities = ['fl', 'if', 'vvs1', 'vvs2', 'vs1', 'vs2', 'si1', 'si2', 'si3', 'i1', 'i2', 'i3'];
  const foundClarity = clarities.find(clarity => lowerText.includes(clarity));
  
  // Price detection
  const priceMatch = lowerText.match(/\$?(\d+(?:,\d{3})*(?:k|000)?)/);
  
  // Calculate confidence based on found elements
  let confidence = 0;
  const keywords = [];
  
  if (foundShape) { confidence += 0.3; keywords.push(`shape:${foundShape}`); }
  if (caratMatch || caratRangeMatch) { confidence += 0.25; keywords.push('carat'); }
  if (foundColor) { confidence += 0.2; keywords.push(`color:${foundColor}`); }
  if (foundClarity) { confidence += 0.2; keywords.push(`clarity:${foundClarity}`); }
  if (priceMatch) { confidence += 0.15; keywords.push('price'); }
  
  // Check for diamond-related keywords
  const diamondKeywords = ['diamond', 'stone', 'brilliant', 'engagement', 'wedding', 'ring'];
  if (diamondKeywords.some(keyword => lowerText.includes(keyword))) {
    confidence += 0.1;
    keywords.push('diamond_context');
  }

  return {
    shape: foundShape,
    carat_min: caratRangeMatch ? parseFloat(caratRangeMatch[1]) : caratMatch ? parseFloat(caratMatch[1]) * 0.9 : undefined,
    carat_max: caratRangeMatch ? parseFloat(caratRangeMatch[2]) : caratMatch ? parseFloat(caratMatch[1]) * 1.1 : undefined,
    color: foundColor,
    clarity: foundClarity,
    price_max: priceMatch ? parsePrice(priceMatch[1]) : undefined,
    keywords,
    confidence
  };
}

function parsePrice(priceStr: string): number {
  const cleanPrice = priceStr.replace(/,/g, '');
  if (cleanPrice.endsWith('k')) {
    return parseFloat(cleanPrice.slice(0, -1)) * 1000;
  }
  return parseFloat(cleanPrice);
}

async function findMatchingDiamonds(request: DiamondRequest) {
  if (!backendUrl || !backendAccessToken) {
    console.log('📱 Backend not configured, skipping inventory search');
    return [];
  }

  try {
    // Get all dealers
    const { data: dealers, error: dealersError } = await supabase
      .from('user_profiles')
      .select('telegram_id');

    if (dealersError) {
      console.error('❌ Error fetching dealers:', dealersError);
      return [];
    }

    const matches = [];

    // Search each dealer's inventory
    for (const dealer of dealers) {
      try {
        const inventoryUrl = `${backendUrl}/api/v1/get_all_stones?user_id=${dealer.telegram_id}`;
        
        const response = await fetch(inventoryUrl, {
          headers: {
            'Authorization': `Bearer ${backendAccessToken}`,
            'Accept': 'application/json',
          }
        });

        if (!response.ok) continue;

        const inventoryData = await response.json();
        let diamonds = Array.isArray(inventoryData) ? inventoryData : inventoryData.data || [];

        // Filter diamonds based on request
        const matchingDiamonds = diamonds.filter(diamond => {
          let score = 0;

          if (request.shape && diamond.shape?.toLowerCase() === request.shape.toLowerCase()) score += 0.3;
          if (request.carat_min && diamond.weight >= request.carat_min) score += 0.15;
          if (request.carat_max && diamond.weight <= request.carat_max) score += 0.15;
          if (request.color && diamond.color?.toLowerCase() === request.color.toLowerCase()) score += 0.2;
          if (request.clarity && diamond.clarity?.toLowerCase() === request.clarity.toLowerCase()) score += 0.2;
          if (request.price_max && diamond.price_per_carat * diamond.weight <= request.price_max) score += 0.1;

          return score >= 0.3; // At least 30% match
        });

        if (matchingDiamonds.length > 0) {
          matches.push({
            dealer_telegram_id: dealer.telegram_id,
            diamonds: matchingDiamonds.slice(0, 5) // Limit to top 5 matches
          });
        }

      } catch (error) {
        console.error(`❌ Error searching inventory for dealer ${dealer.telegram_id}:`, error);
      }
    }

    return matches;
  } catch (error) {
    console.error('❌ Error in findMatchingDiamonds:', error);
    return [];
  }
}

async function handleSFTPSetupRequest(user: any) {
  console.log('🔗 SFTP setup request from user:', user.id, user.first_name);
  
  try {
    // Send response message to user
    const message = `שלום ${user.first_name}! 👋

🚀 בקשתך לחיבור SFTP התקבלה בהצלחה!

צוות Acadia יצור איתך קשר בקרוב עם פרטי החיבור והוראות ההתקנה.

📧 במקביל, תוכל גם לפנות ישירות ל:
info@accadiasoftware.com

💎 בינתיים, תוכל להמשיך להשתמש במערכת דרך האפליקציה.

תודה על הפנייה! 🙏`;

    // Log the SFTP request in database for Acadia team follow-up
    const { error: logError } = await supabase
      .from('sftp_requests')
      .insert([{
        telegram_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name || null,
        username: user.username || null,
        status: 'pending',
        requested_at: new Date().toISOString()
      }]);

    if (logError) {
      console.error('❌ Error logging SFTP request:', logError);
    } else {
      console.log('✅ SFTP request logged successfully');
    }

    // Send confirmation message to user via Telegram Bot API
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (botToken) {
      const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.id,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        console.error('❌ Failed to send Telegram message:', await response.text());
      } else {
        console.log('✅ Confirmation message sent to user');
      }
    }

  } catch (error) {
    console.error('❌ Error handling SFTP setup request:', error);
  }
}

async function generateDiamondPostFromPayment(message: any) {
  try {
    console.log('💎 Generating diamond post for payment confirmation');
    
    // Call the generate-diamond-post function
    const response = await supabase.functions.invoke('generate-diamond-post', {
      body: {
        telegram_id: message.from.id,
        chat_id: message.chat.id.toString(),
        platform: 'telegram'
      }
    });

    if (response.error) {
      console.error('❌ Error generating diamond post:', response.error);
    } else {
      console.log('✅ Diamond post generated successfully');
      
      // Create a notification with the generated post
      await createGroupNotification({
        telegram_id: message.from.id,
        message_type: 'diamond_post_generated',
        message_content: '💎 Your diamond post has been generated!',
        metadata: {
          generated_post: response.data,
          original_message: message.text,
          chat_id: message.chat.id,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('❌ Error in generateDiamondPostFromPayment:', error);
  }
}

async function saveIncomingMessage(message: any) {
  try {
    const diamondRequest = parseDiamondRequest(message.text);
    
    const { error } = await supabase
      .from('chatbot_messages')
      .insert([{
        telegram_id: message.from.id,
        message_text: message.text,
        chat_id: message.chat.id,
        chat_type: message.chat.type,
        chat_title: message.chat.title,
        sender_info: {
          id: message.from.id,
          first_name: message.from.first_name,
          last_name: message.from.last_name,
          username: message.from.username
        },
        parsed_data: diamondRequest,
        confidence_score: diamondRequest.confidence,
        message_timestamp: new Date(message.date * 1000).toISOString()
      }]);

    if (error) {
      console.error('❌ Error saving incoming message:', error);
    } else {
      console.log(`✅ Saved incoming message from ${message.from.first_name}`);
    }
  } catch (error) {
    console.error('❌ Error in saveIncomingMessage:', error);
  }
}

async function createGroupNotification(notification: any) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        telegram_id: notification.telegram_id,
        message_type: notification.message_type,
        message_content: notification.message_content,
        metadata: notification.metadata,
        status: 'sent'
      }]);

    if (error) {
      console.error('❌ Error creating notification:', error);
    } else {
      console.log(`✅ Created notification for dealer ${notification.telegram_id}`);
    }
  } catch (error) {
    console.error('❌ Error in createGroupNotification:', error);
  }
}

async function verifyTelegramRequest(req: Request): Promise<{valid: boolean, reason?: string}> {
  try {
    // 1. Check if webhook secret is configured
    if (!telegramWebhookSecret) {
      console.warn('⚠️ TELEGRAM_WEBHOOK_SECRET not configured - using basic validation');
      return { valid: true }; // Allow for backward compatibility
    }

    // 2. Verify secret token header
    const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (secretToken !== telegramWebhookSecret) {
      return { 
        valid: false, 
        reason: 'Invalid or missing secret token' 
      };
    }

    // 3. Verify request comes from Telegram's IP ranges (optional additional security)
    const forwardedFor = req.headers.get('X-Forwarded-For');
    const realIP = req.headers.get('X-Real-IP');
    const clientIP = forwardedFor?.split(',')[0] || realIP;
    
    if (clientIP) {
      const isFromTelegram = allowedTelegramIPs.some(range => {
        return isIPInRange(clientIP, range);
      });
      
      if (!isFromTelegram) {
        console.warn(`⚠️ Request from non-Telegram IP: ${clientIP}`);
        // Note: We don't block here as IP ranges might change
      }
    }

    // 4. Rate limiting - basic check
    const userAgent = req.headers.get('User-Agent');
    if (!userAgent || !userAgent.includes('TelegramBot')) {
      return { 
        valid: false, 
        reason: 'Invalid User-Agent' 
      };
    }

    return { valid: true };

  } catch (error) {
    console.error('❌ Error in security check:', error);
    return { 
      valid: false, 
      reason: 'Security verification failed' 
    };
  }
}

function isIPInRange(ip: string, range: string): boolean {
  try {
    const [rangeIP, prefixLength] = range.split('/');
    const ipNum = ipToNumber(ip);
    const rangeNum = ipToNumber(rangeIP);
    const mask = (0xFFFFFFFF << (32 - parseInt(prefixLength))) >>> 0;
    
    return (ipNum & mask) === (rangeNum & mask);
  } catch {
    return false;
  }
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}
