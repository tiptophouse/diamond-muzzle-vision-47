import { z } from 'zod';

/**
 * Comprehensive Zod validation schema for diamond form
 * Ensures data integrity and security before API submission
 */
export const diamondFormSchema = z.object({
  // Basic Information (Required)
  stockNumber: z.string()
    .trim()
    .min(1, 'מספר מלאי נדרש')
    .max(100, 'מספר מלאי ארוך מדי'),
  
  shape: z.string()
    .min(1, 'צורה נדרשת'),
  
  carat: z.number()
    .positive('משקל חייב להיות חיובי')
    .min(0.01, 'משקל מינימלי 0.01 קרט')
    .max(100, 'משקל מקסימלי 100 קרט'),
  
  color: z.string()
    .min(1, 'צבע נדרש'),
  
  clarity: z.string()
    .min(1, 'בהירות נדרשת'),
  
  cut: z.string(),
  
  // Certificate Information (Optional)
  certificateNumber: z.string()
    .trim()
    .max(100, 'מספר תעודה ארוך מדי')
    .optional(),
  
  certificateUrl: z.string()
    .trim()
    .url('כתובת URL לא תקינה')
    .max(500, 'כתובת URL ארוכה מדי')
    .optional()
    .or(z.literal('')),
  
  certificateComment: z.string()
    .trim()
    .max(1000, 'הערה ארוכה מדי')
    .optional(),
  
  lab: z.string()
    .optional(),
  
  // Physical Measurements (Optional)
  length: z.number()
    .positive('אורך חייב להיות חיובי')
    .max(100, 'אורך מקסימלי 100 מ"מ')
    .optional(),
  
  width: z.number()
    .positive('רוחב חייב להיות חיובי')
    .max(100, 'רוחב מקסימלי 100 מ"מ')
    .optional(),
  
  depth: z.number()
    .positive('עומק חייב להיות חיובי')
    .max(100, 'עומק מקסימלי 100 מ"מ')
    .optional(),
  
  ratio: z.number()
    .positive('יחס חייב להיות חיובי')
    .max(10, 'יחס מקסימלי 10'),
  
  // Detailed Grading (Optional)
  tablePercentage: z.number()
    .min(0, 'אחוז שולחן לא יכול להיות שלילי')
    .max(100, 'אחוז שולחן מקסימלי 100')
    .optional(),
  
  depthPercentage: z.number()
    .min(0, 'אחוז עומק לא יכול להיות שלילי')
    .max(100, 'אחוז עומק מקסימלי 100')
    .optional(),
  
  fluorescence: z.string().optional(),
  polish: z.string().optional(),
  symmetry: z.string().optional(),
  gridle: z.string().optional(),
  culet: z.string().optional(),
  
  // Business Information
  price: z.number()
    .nonnegative('מחיר לא יכול להיות שלילי')
    .max(100000000, 'מחיר מקסימלי 100 מיליון'),
  
  pricePerCarat: z.number()
    .nonnegative('מחיר לקרט לא יכול להיות שלילי')
    .max(10000000, 'מחיר לקרט מקסימלי 10 מיליון')
    .optional(),
  
  rapnet: z.number()
    .optional(),
  
  status: z.string(),
  
  storeVisible: z.boolean()
    .optional(),
  
  // Media
  picture: z.string()
    .trim()
    .max(1000, 'כתובת תמונה ארוכה מדי')
    .optional(),
  
  gem360Url: z.string()
    .trim()
    .url('כתובת 360 לא תקינה')
    .max(1000, 'כתובת 360 ארוכה מדי')
    .optional()
    .or(z.literal('')),
});

export type DiamondFormValues = z.infer<typeof diamondFormSchema>;

/**
 * Validate diamond form data
 * @param data - Form data to validate
 * @returns Validation result with errors if invalid
 */
export function validateDiamondForm(data: unknown) {
  return diamondFormSchema.safeParse(data);
}
