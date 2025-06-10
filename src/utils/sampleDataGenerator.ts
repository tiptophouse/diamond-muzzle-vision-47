
import { DiamondFormData } from "@/components/inventory/form/types";

const shapes = ["Round", "Princess", "Emerald", "Asscher", "Oval", "Radiant", "Cushion", "Marquise", "Heart", "Pear"];
const colors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const clarities = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2"];
const cuts = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
const statuses = ["Available", "Reserved", "Sold"];
const labs = ["GIA", "AGS", "EGL", "GCAL", "SSEF"];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomPrice(carat: number): number {
  const basePrice = Math.floor(Math.random() * 8000) + 2000; // $2000-$10000 per carat
  return Math.floor(basePrice * carat);
}

export function generateSampleDiamond(index: number): DiamondFormData {
  const carat = Math.round((Math.random() * 3 + 0.5) * 100) / 100; // 0.5 to 3.5 carats
  const shape = getRandomElement(shapes);
  const color = getRandomElement(colors);
  const clarity = getRandomElement(clarities);
  
  return {
    stockNumber: `SAMPLE-${String(index + 1).padStart(4, '0')}`,
    shape,
    carat,
    color,
    clarity,
    cut: getRandomElement(cuts),
    price: generateRandomPrice(carat),
    status: getRandomElement(statuses),
    imageUrl: `https://picsum.photos/400/400?random=${index}`,
    additional_images: [],
    store_visible: Math.random() > 0.3, // 70% visible
    fluorescence: Math.random() > 0.7 ? getRandomElement(["None", "Faint", "Medium", "Strong"]) : "None",
    lab: getRandomElement(labs),
    polish: getRandomElement(["Excellent", "Very Good", "Good"]),
    symmetry: getRandomElement(["Excellent", "Very Good", "Good"]),
    certificate_number: `${getRandomElement(labs)}${Math.floor(Math.random() * 9000000) + 1000000}`,
  };
}

export function generateSampleDiamonds(count: number = 10): DiamondFormData[] {
  return Array.from({ length: count }, (_, index) => generateSampleDiamond(index));
}
