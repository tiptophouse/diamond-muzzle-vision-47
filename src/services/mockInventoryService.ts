
import { Diamond } from "@/components/inventory/InventoryTable";

const mockDiamonds: Diamond[] = [
  {
    id: "1",
    stockNumber: "D001",
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
    id: "2", 
    stockNumber: "D002",
    shape: "Princess",
    carat: 0.95,
    color: "G",
    clarity: "VVS2",
    cut: "Very Good",
    price: 6200,
    status: "Available",
    imageUrl: "",
    store_visible: true
  },
  {
    id: "3",
    stockNumber: "D003", 
    shape: "Emerald",
    carat: 1.50,
    color: "H",
    clarity: "VS2",
    cut: "Good",
    price: 7800,
    status: "Reserved",
    imageUrl: "",
    store_visible: false
  },
  {
    id: "4",
    stockNumber: "D004",
    shape: "Oval",
    carat: 2.00,
    color: "E",
    clarity: "FL",
    cut: "Excellent", 
    price: 15000,
    status: "Available",
    imageUrl: "",
    store_visible: true
  },
  {
    id: "5",
    stockNumber: "D005",
    shape: "Cushion",
    carat: 1.75,
    color: "D",
    clarity: "IF",
    cut: "Excellent",
    price: 12500,
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
  console.log('🔍 MOCK SERVICE: Providing fallback diamond data');
  
  // Simulate a small delay like a real API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    data: mockDiamonds,
    debugInfo: {
      step: 'SUCCESS: Mock data provided',
      totalDiamonds: mockDiamonds.length,
      source: 'mock_service',
      timestamp: new Date().toISOString()
    }
  };
}
