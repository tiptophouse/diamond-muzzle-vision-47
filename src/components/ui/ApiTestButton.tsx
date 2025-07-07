import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api/config';

export function ApiTestButton() {
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testApi = async () => {
    setTesting(true);
    
    // Test data that matches the FastAPI schema exactly
    const testData = {
      stock: "TEST-12345",
      shape: "round brilliant",
      weight: 1.5,
      color: "D",
      clarity: "FL",
      lab: "GIA",
      certificate_number: 123456789,
      length: 7.2,
      width: 7.2,
      depth: 4.5,
      ratio: 1.0,
      cut: "EXCELLENT",
      polish: "EXCELLENT",
      symmetry: "EXCELLENT",
      fluorescence: "NONE",
      table: 57,
      depth_percentage: 62,
      gridle: "Medium",
      culet: "NONE",
      certificate_comment: "API Test Diamond",
      rapnet: -15,
      price_per_carat: 8500,
      picture: ""
    };

    try {
      console.log('🧪 Testing FastAPI connection:', `${API_BASE_URL}/api/v1/diamonds?user_id=6485315240`);
      console.log('🧪 Test payload:', testData);

      const response = await fetch(`${API_BASE_URL}/api/v1/diamonds?user_id=6485315240`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('🧪 FastAPI Response status:', response.status);
      const responseData = await response.text();
      console.log('🧪 FastAPI Response body:', responseData);

      if (response.ok) {
        toast({
          title: "✅ FastAPI Connection Successful",
          description: `Connected to ${API_BASE_URL}. Test diamond added successfully!`,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${responseData}`);
      }

    } catch (error) {
      console.error('❌ FastAPI Test Failed:', error);
      toast({
        variant: "destructive",
        title: "❌ FastAPI Connection Failed",
        description: `Could not connect to ${API_BASE_URL}. Check if your FastAPI server is running on localhost:8000`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button 
      onClick={testApi} 
      disabled={testing}
      variant="outline"
      className="mb-4"
    >
      {testing ? "Testing API..." : "🧪 Test FastAPI Connection"}
    </Button>
  );
}