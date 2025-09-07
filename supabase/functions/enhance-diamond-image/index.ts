import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageEnhancementRequest {
  imageUrl: string;
  diamondData: {
    shape: string;
    carat: number;
    stockNumber: string;
  };
  options?: {
    addAnimation?: boolean;
    addFrame?: boolean;
    optimize?: boolean;
  };
}

serve(async (req) => {
  console.log('🖼️ Diamond image enhancement service invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, diamondData, options = {} }: ImageEnhancementRequest = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎨 Processing image:', {
      url: imageUrl.substring(0, 50) + '...',
      shape: diamondData.shape,
      carat: diamondData.carat,
      options
    });

    // Validate and enhance the image URL
    let enhancedUrl = imageUrl;
    
    // For Segoma URLs, add quality parameters if possible
    if (imageUrl.includes('segoma.com')) {
      console.log('✨ Optimizing Segoma image URL');
      // Add quality parameters for better display
      const urlObj = new URL(imageUrl);
      urlObj.searchParams.set('w', '800'); // Width optimization
      urlObj.searchParams.set('q', '90');  // Quality optimization
      enhancedUrl = urlObj.toString();
    }

    // For other diamond providers, add optimization parameters
    else if (imageUrl.includes('sarine.com') || imageUrl.includes('gcal.com')) {
      console.log('✨ Optimizing diamond provider image');
      // These providers usually support size parameters
      if (!imageUrl.includes('size=') && !imageUrl.includes('w=')) {
        const separator = imageUrl.includes('?') ? '&' : '?';
        enhancedUrl = `${imageUrl}${separator}size=large&quality=high`;
      }
    }

    // Create animated version if requested and supported
    let animationUrl = null;
    if (options.addAnimation) {
      console.log('🔄 Creating animated version');
      
      // For now, we'll create a CSS-based rotation effect by returning special metadata
      // In the future, this could generate actual animated GIFs
      animationUrl = enhancedUrl; // Same URL but with animation metadata
    }

    // Test image accessibility
    console.log('🔍 Testing image accessibility');
    const imageResponse = await fetch(enhancedUrl, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'TelegramBot/1.0'
      }
    }).catch(() => null);

    const isAccessible = imageResponse && imageResponse.ok;
    console.log('📶 Image accessibility:', isAccessible ? '✅ Accessible' : '❌ Not accessible');

    // Generate professional diamond presentation metadata
    const enhancementData = {
      originalUrl: imageUrl,
      enhancedUrl: isAccessible ? enhancedUrl : null,
      animationUrl: options.addAnimation ? animationUrl : null,
      isAccessible,
      optimization: {
        provider: getImageProvider(imageUrl),
        hasQualityParams: enhancedUrl !== imageUrl,
        recommendedSize: '800x800',
        format: 'photo' // vs 'animation'
      },
      presentation: {
        shouldAnimate: options.addAnimation && isAccessible,
        frameStyle: options.addFrame ? 'professional' : 'none',
        fallbackAvailable: true
      },
      metadata: {
        shape: diamondData.shape,
        carat: diamondData.carat,
        stockNumber: diamondData.stockNumber,
        processingTimestamp: new Date().toISOString()
      }
    };

    console.log('✅ Image enhancement completed:', {
      accessible: isAccessible,
      enhanced: enhancedUrl !== imageUrl,
      animated: !!animationUrl
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: enhancementData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Image enhancement error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fallback: 'Use original image without enhancement'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getImageProvider(url: string): string {
  if (url.includes('segoma.com')) return 'segoma';
  if (url.includes('sarine.com')) return 'sarine';
  if (url.includes('gcal.com')) return 'gcal';
  if (url.includes('gemfacts.com')) return 'gemfacts';
  if (url.includes('my360.fab')) return 'fab';
  return 'unknown';
}