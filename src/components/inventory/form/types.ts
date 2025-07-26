
import { z } from 'zod';

export const diamondFormSchema = z.object({
  // Basic Information
  stockNumber: z.string().min(1, 'Stock number is required'),
  shape: z.string().min(1, 'Shape is required'),
  carat: z.number().positive('Carat must be positive'),
  color: z.string().min(1, 'Color is required'),
  clarity: z.string().min(1, 'Clarity is required'),
  cut: z.string().optional(),
  
  // Certificate Information
  certificateNumber: z.string().optional(),
  certificateUrl: z.string().optional(),
  certificateComment: z.string().optional(),
  lab: z.string().optional(),
  
  // Physical Measurements
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  ratio: z.number().positive().optional(),
  
  // Detailed Grading
  tablePercentage: z.number().min(1).max(100).optional(),
  depthPercentage: z.number().min(1).max(100).optional(),
  fluorescence: z.string().optional(),
  polish: z.string().optional(),
  symmetry: z.string().optional(),
  gridle: z.string().optional(),
  culet: z.string().optional(),
  
  // Business Information
  price: z.number().positive('Price must be positive'),
  pricePerCarat: z.number().positive().optional(),
  rapnet: z.number().optional(),
  status: z.string().min(1, 'Status is required'),
  storeVisible: z.boolean().optional(),
  
  // Image
  picture: z.string().optional(),
});

export interface DiamondFormData {
  // Basic Information
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  
  // Certificate Information
  certificateNumber?: string;
  certificateUrl?: string;
  certificateComment?: string;
  lab?: string;
  
  // Physical Measurements
  length?: number;
  width?: number;
  depth?: number;
  ratio?: number;
  
  // Detailed Grading
  tablePercentage?: number;
  depthPercentage?: number;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  gridle?: string;
  culet?: string;
  
  // Business Information
  price: number;
  pricePerCarat?: number;
  rapnet?: number;
  status: string;
  storeVisible?: boolean;
  
  // Image
  picture?: string;
}
