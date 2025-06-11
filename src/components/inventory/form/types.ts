
import { z } from "zod";

export interface DiamondFormData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  imageUrl?: string;
  additional_images?: string[];
  certificateNumber?: string;
  certificate_number?: string;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  tablePercentage?: number;
  depthPercentage?: number;
  lab?: string;
  store_visible?: boolean;
}

export const diamondFormSchema = z.object({
  stockNumber: z.string().min(1, "Stock number is required"),
  shape: z.string().min(1, "Shape is required"),
  carat: z.number().min(0.01, "Carat must be greater than 0"),
  color: z.string().min(1, "Color is required"),
  clarity: z.string().min(1, "Clarity is required"),
  cut: z.string().min(1, "Cut is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  status: z.string().min(1, "Status is required"),
  imageUrl: z.string().optional(),
  additional_images: z.array(z.string()).optional(),
  certificateNumber: z.string().optional(),
  certificate_number: z.string().optional(),
  fluorescence: z.string().optional(),
  polish: z.string().optional(),
  symmetry: z.string().optional(),
  tablePercentage: z.number().optional(),
  depthPercentage: z.number().optional(),
  lab: z.string().optional(),
  store_visible: z.boolean().optional(),
});
