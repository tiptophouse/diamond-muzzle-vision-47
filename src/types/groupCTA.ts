
export interface FastAPIResponse {
  button_clicked?: string;
  utm_source?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface GroupCTAClick {
  id: string;
  telegram_id: number;
  start_parameter: string;
  source_group_id?: number;
  user_agent: string;
  registration_attempted: boolean;
  registration_success: boolean;
  registration_token?: string;
  registration_error?: string;
  fastapi_response?: FastAPIResponse;
  clicked_at: string;
}

// Type guard to safely check if Json is a FastAPIResponse
export function isFastAPIResponse(json: any): json is FastAPIResponse {
  return json && typeof json === 'object' && !Array.isArray(json);
}

// Helper to safely get button_clicked from Json
export function getButtonClicked(fastapi_response: any): string {
  if (isFastAPIResponse(fastapi_response) && typeof fastapi_response.button_clicked === 'string') {
    return fastapi_response.button_clicked;
  }
  return 'לא ידוע';
}
