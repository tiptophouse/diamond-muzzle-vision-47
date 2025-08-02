
import { Diamond } from "@/components/inventory/InventoryTable";

const mockDiamonds: Diamond[] = [
  // TEST DIAMOND WITH v360.in (SHOULD APPEAR FIRST)
  {
    id: "test-v360-1",
    stockNumber: "TEST-360-001",
    shape: "Round",
    carat: 2.25,
    color: "J",
    clarity: "SI2",
    cut: "Excellent",
    price: 5520,
    status: "Available",
    imageUrl: "",
    gem360Url: "https://v360.in/diamondview.aspx?cid=YBDB&d=R2.2L160780",
    store_visible: true
  },
  // TEST DIAMOND WITH v360.in (SHOULD APPEAR FIRST)
  {
    id: "test-v360-2",
    stockNumber: "TEST-360-002",
    shape: "Round",
    carat: 1.12,
    color: "H",
    clarity: "I1",
    cut: "Excellent",
    price: 1250,
    status: "Available",
    imageUrl: "",
    gem360Url: "https://v360.in/diamondview.aspx?cid=YBDB&d=R1.0L190086",
    store_visible: true
  },
  // REGULAR DIAMOND WITH IMAGE (SHOULD APPEAR AFTER 360°)
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
    imageUrl: "https://app.barakdiamonds.com/Kashi/Output/StoneImages/10001p.jpg",
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
    imageUrl: "https://app.barakdiamonds.com/Kashi/Output/StoneImages/10002p.jpg",
    store_visible: true
  },
  // INFO-ONLY DIAMOND (SHOULD APPEAR LAST)
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
  console.warn('⚠️ MOCK SERVICE: Using test data with v360.in diamonds - you should see 2 interactive 360° diamonds FIRST');
  console.warn('⚠️ MOCK SERVICE: The first 2 diamonds have v360.in URLs and should display interactive viewers');
  console.warn('⚠️ MOCK SERVICE: Check if your real diamonds have Video link field with v360.in URLs');
  
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
