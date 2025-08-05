
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
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center",
    gem360Url: "https://v360.in/demo/round",
    picture: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center",
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
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center",
    picture: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center",
    store_visible: true
  },
  {
    id: "mock-3",
    stockNumber: "MOCK-D003", 
    shape: "Emerald",
    carat: 1.50,
    color: "H",
    clarity: "VS2",
    cut: "Good",
    price: 7800,
    status: "Available",
    imageUrl: "https://images.unsplash.com/photo-1544997845-3e191bf75b3c?w=400&h=400&fit=crop&crop=center",
    picture: "https://images.unsplash.com/photo-1544997845-3e191bf75b3c?w=400&h=400&fit=crop&crop=center",
    store_visible: true
  },
  {
    id: "mock-4",
    stockNumber: "MOCK-D004",
    shape: "Oval",
    carat: 2.00,
    color: "E",
    clarity: "FL",
    cut: "Excellent", 
    price: 15000,
    status: "Available",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center&auto=format&q=75",
    picture: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center&auto=format&q=75",
    store_visible: true
  },
  {
    id: "mock-5",
    stockNumber: "MOCK-D005",
    shape: "Cushion",
    carat: 1.75,
    color: "D",
    clarity: "IF",
    cut: "Excellent",
    price: 12500,
    status: "Available",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center&auto=format&q=75",
    picture: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center&auto=format&q=75",
    store_visible: true
  }
];

export interface MockInventoryResult {
  data: Diamond[];
  error?: string;
  debugInfo: any;
}

export async function fetchMockInventoryData(): Promise<MockInventoryResult> {
  console.warn('⚠️ MOCK SERVICE: Using fallback mock data - this is why you see only 5 diamonds instead of your 500 real diamonds');
  console.warn('⚠️ MOCK SERVICE: Your real diamonds are in the FastAPI backend but connection failed');
  console.warn('⚠️ MOCK SERVICE: Check FastAPI server status and connectivity to access your 500 diamonds');
  
  // Simulate a small delay like a real API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    data: mockDiamonds,
    debugInfo: {
      step: 'FALLBACK: Mock data provided (NOT YOUR REAL DATA)',
      totalDiamonds: mockDiamonds.length,
      source: 'mock_service',
      timestamp: new Date().toISOString(),
      warning: 'This is NOT your real 500 diamonds - FastAPI connection failed',
      realDataLocation: 'FastAPI backend database',
      expectedDiamonds: 500
    }
  };
}
