// Backend configuration
// Update this URL to match your FastAPI backend deployment
export const BACKEND_URL = 'https://your-fastapi-backend.com';

// You can also fetch this from Supabase app_settings if needed
export async function getBackendUrl(): Promise<string> {
  // For now, return the hardcoded URL
  // In the future, you could fetch this from Supabase:
  // const { data } = await supabase
  //   .from('app_settings')
  //   .select('setting_value')
  //   .eq('setting_key', 'backend_url')
  //   .single();
  // return data?.setting_value || BACKEND_URL;
  
  return BACKEND_URL;
}
