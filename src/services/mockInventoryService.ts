
import { Diamond } from "@/components/inventory/InventoryTable";

const mockDiamonds: Diamond[] = [
  {
    id: "mock-1",
    stockNumber: "MOCK-D001",
    shape: "Round",
    carat: 1.25,
    color: "F",
    clarity: "VS1",
    cut: "Excellent",
    price: 8500,
    status: "Available",
    imageUrl: "",
    store_visible: true
  },
  {
    id: "mock-2", 
    stockNumber: "MOCK-D002",
    shape: "Princess",
    carat: 0.95,
    color: "G",
    clarity: "VVS2",
    cut: "Very Good",
    price: 6200,
    status: "Available",
    imageUrl: "",
    store_visible: true
  }
];

export interface MockInventoryResult {
  data: Diamond[];
  error?: string;
  debugInfo: any;
}

export async function fetchMockInventoryData(): Promise<MockInventoryResult> {
  console.warn('⚠️ MOCK SERVICE: This should NOT be used anymore - FastAPI connection should work');
  console.warn('⚠️ MOCK SERVICE: If you see this, there is a problem connecting to https://api.mazalbot.com');
  console.warn('⚠️ MOCK SERVICE: Check your FastAPI server status and fix the connection issue');
  
  // Simulate a small delay like a real API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    data: mockDiamonds,
    error: 'Using fallback mock data - FastAPI connection failed',
    debugInfo: {
      step: 'FALLBACK: Mock data provided (connection to FastAPI failed)',
      totalDiamonds: mockDiamonds.length,
      source: 'mock_service',
      timestamp: new Date().toISOString(),
      warning: 'This is mock data - your real diamonds are in the FastAPI database',
      realDataLocation: 'FastAPI backend at https://api.mazalbot.com',
      action: 'Fix FastAPI connection to see your real diamonds'
    }
  };
}
