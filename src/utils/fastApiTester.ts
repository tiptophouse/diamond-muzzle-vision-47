
// FastAPI Connection Tester Utility
export class FastApiTester {
  private static readonly BASE_URL = 'https://api.mazalbot.com';
  private static readonly TEST_TOKEN = 'ifj9ov1rh20fslfp'; // This should be rotated ASAP
  private static readonly TEST_USER_ID = 2138564172;

  static async testDirectConnection(): Promise<{
    success: boolean;
    statusCode?: number;
    error?: string;
    data?: any;
    endpoint: string;
  }> {
    const endpoint = `/api/v1/get_all_stones?user_id=${this.TEST_USER_ID}`;
    const fullUrl = `${this.BASE_URL}${endpoint}`;
    
    console.log('🧪 Testing direct FastAPI connection...');
    console.log('🧪 URL:', fullUrl);
    console.log('🧪 Token:', this.TEST_TOKEN.substring(0, 8) + '...');
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.TEST_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-ID': this.TEST_USER_ID.toString(),
        },
      });

      console.log('🧪 Response status:', response.status);
      console.log('🧪 Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        return {
          success: false,
          statusCode: response.status,
          error: this.analyzeHttpError(response.status, responseData),
          data: responseData,
          endpoint
        };
      }

      return {
        success: true,
        statusCode: response.status,
        data: responseData,
        endpoint
      };

    } catch (error) {
      console.error('🧪 Network error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        endpoint
      };
    }
  }

  static async testAlternativeEndpoints(): Promise<Array<{
    endpoint: string;
    status: number;
    success: boolean;
    error?: string;
  }>> {
    const endpoints = [
      `/api/v1/get_all_stones?user_id=${this.TEST_USER_ID}`,
      `/get_all_stones?user_id=${this.TEST_USER_ID}`,
      `/api/v1/stones?user_id=${this.TEST_USER_ID}`,
      `/stones?user_id=${this.TEST_USER_ID}`,
      `/api/v1/inventory?user_id=${this.TEST_USER_ID}`,
    ];

    const results = [];

    for (const endpoint of endpoints) {
      const fullUrl = `${this.BASE_URL}${endpoint}`;
      
      try {
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.TEST_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        results.push({
          endpoint,
          status: response.status,
          success: response.ok,
          error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
        });

      } catch (error) {
        results.push({
          endpoint,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Network error'
        });
      }
    }

    return results;
  }

  private static analyzeHttpError(status: number, data: any): string {
    switch (status) {
      case 401:
        return 'Authentication failed - Invalid or expired token. Please rotate BACKEND_ACCESS_TOKEN.';
      case 403:
        return 'Access forbidden - Token may not have required permissions for this endpoint.';
      case 404:
        return 'Endpoint not found - The API path may be incorrect or the FastAPI server routing is misconfigured.';
      case 422:
        return 'Validation error - Request parameters are invalid or missing required fields.';
      case 500:
        return 'Internal server error - Check FastAPI server logs for detailed error information.';
      case 502:
        return 'Bad gateway - FastAPI server may be down or unreachable.';
      case 503:
        return 'Service unavailable - FastAPI server is temporarily overloaded.';
      case 504:
        return 'Gateway timeout - FastAPI server is not responding within expected time.';
      default:
        return `HTTP ${status} error. Response: ${JSON.stringify(data)}`;
    }
  }

  static async runFullDiagnostic(): Promise<{
    directTest: any;
    alternativeEndpoints: any[];
    recommendations: string[];
  }> {
    console.log('🔍 Running full FastAPI diagnostic...');
    
    const directTest = await this.testDirectConnection();
    const alternativeEndpoints = await this.testAlternativeEndpoints();
    
    const recommendations = this.generateRecommendations(directTest, alternativeEndpoints);
    
    return {
      directTest,
      alternativeEndpoints,
      recommendations
    };
  }

  private static generateRecommendations(directTest: any, alternativeTests: any[]): string[] {
    const recommendations = [];
    
    // Security recommendation
    recommendations.push('🔒 CRITICAL: Rotate the backend token "ifj9ov1rh20fslfp" immediately as it was exposed in logs');
    
    if (!directTest.success) {
      if (directTest.statusCode === 404) {
        recommendations.push('🔧 Check FastAPI routing - the endpoint /api/v1/get_all_stones may not exist');
        recommendations.push('📖 Verify your FastAPI documentation for correct endpoint paths');
      }
      
      if (directTest.statusCode === 403 || directTest.statusCode === 401) {
        recommendations.push('🔑 Verify BACKEND_ACCESS_TOKEN in Supabase secrets matches your FastAPI configuration');
        recommendations.push('🔐 Check if your FastAPI requires specific token format or additional headers');
      }
      
      if (directTest.statusCode === 500) {
        recommendations.push('🚨 Check FastAPI server logs for internal errors');
        recommendations.push('💾 Verify database connectivity and data integrity on FastAPI side');
      }
      
      if (!directTest.statusCode) {
        recommendations.push('🌐 Verify https://api.mazalbot.com is accessible and FastAPI server is running');
        recommendations.push('🔧 Check DNS resolution and network connectivity');
      }
    }
    
    // Check if any alternative endpoints worked
    const workingEndpoints = alternativeTests.filter(test => test.success);
    if (workingEndpoints.length > 0) {
      recommendations.push(`✅ Working endpoints found: ${workingEndpoints.map(e => e.endpoint).join(', ')}`);
      recommendations.push('🔄 Update your API configuration to use the working endpoints');
    }
    
    return recommendations;
  }
}
