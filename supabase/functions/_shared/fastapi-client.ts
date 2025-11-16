/**
 * Shared FastAPI Client for Edge Functions
 * Provides unified access to diamond data from FastAPI backend
 */

const FASTAPI_URL = Deno.env.get('FASTAPI_URL') || Deno.env.get('BACKEND_URL');
const FASTAPI_BEARER_TOKEN = Deno.env.get('FASTAPI_BEARER_TOKEN') || Deno.env.get('BACKEND_ACCESS_TOKEN');

export interface DiamondData {
  stock_number: string;
  weight: number;
  shape: string;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  price_per_carat?: number;
  certificate_number?: number;
  lab?: string;
  picture?: string;
  certificate_url?: string;
  gem360_url?: string;
  video_url?: string;
  v360_url?: string;
}

export async function fetchDiamondFromFastAPI(
  stockNumber: string,
  telegramId: number
): Promise<DiamondData | null> {
  try {
    if (!FASTAPI_URL || !FASTAPI_BEARER_TOKEN) {
      console.error('❌ FastAPI credentials not configured');
      return null;
    }

    console.log(`📡 Fetching diamond ${stockNumber} from FastAPI for user ${telegramId}`);

    const response = await fetch(`${FASTAPI_URL}/api/v1/get_all_stones`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FASTAPI_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Telegram-User-ID': telegramId.toString(),
      },
    });

    if (!response.ok) {
      console.error(`❌ FastAPI error: ${response.status} ${response.statusText}`);
      return null;
    }

    const stones = await response.json();
    
    if (!Array.isArray(stones)) {
      console.error('❌ FastAPI returned non-array response');
      return null;
    }

    const diamond = stones.find(
      (s: any) => s.stock_number === stockNumber || s.stockNumber === stockNumber
    );

    if (!diamond) {
      console.warn(`⚠️ Diamond ${stockNumber} not found in FastAPI response`);
      return null;
    }

    console.log(`✅ Diamond ${stockNumber} fetched successfully from FastAPI`);
    
    // Normalize field names
    return {
      stock_number: diamond.stock_number || diamond.stockNumber,
      weight: diamond.weight || diamond.carat,
      shape: diamond.shape,
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut || diamond.cut_quality,
      polish: diamond.polish,
      symmetry: diamond.symmetry,
      fluorescence: diamond.fluorescence,
      price_per_carat: diamond.price_per_carat || diamond.pricePerCarat,
      certificate_number: diamond.certificate_number || diamond.certificateNumber,
      lab: diamond.lab,
      picture: diamond.picture || diamond.image || diamond.imageUrl,
      certificate_url: diamond.certificate_url || diamond.certificateUrl,
      gem360_url: diamond.gem360_url || diamond.gem360Url,
      video_url: diamond.video_url || diamond.videoUrl,
      v360_url: diamond.v360_url || diamond.v360Url,
    };
  } catch (error) {
    console.error('❌ Error fetching diamond from FastAPI:', error);
    return null;
  }
}

export async function fetchAllDiamondsFromFastAPI(
  telegramId: number
): Promise<DiamondData[]> {
  try {
    if (!FASTAPI_URL || !FASTAPI_BEARER_TOKEN) {
      console.error('❌ FastAPI credentials not configured');
      return [];
    }

    const response = await fetch(`${FASTAPI_URL}/api/v1/get_all_stones`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FASTAPI_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Telegram-User-ID': telegramId.toString(),
      },
    });

    if (!response.ok) {
      console.error(`❌ FastAPI error: ${response.status}`);
      return [];
    }

    const stones = await response.json();
    return Array.isArray(stones) ? stones : [];
  } catch (error) {
    console.error('❌ Error fetching diamonds from FastAPI:', error);
    return [];
  }
}
