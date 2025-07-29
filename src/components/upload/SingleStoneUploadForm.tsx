
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { QRCodeScanner } from '@/components/inventory/QRCodeScanner';
import { UserImageUpload } from '@/components/inventory/UserImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useInventoryDataSync } from '@/hooks/inventory/useInventoryDataSync';
import { api, apiEndpoints } from '@/lib/api';
import { Camera, Save, Sparkles, CheckCircle } from 'lucide-react';

// Comprehensive diamond validation schema
const diamondSchema = z.object({
  stockNumber: z.string().min(1, "Stock number is required"),
  shape: z.enum(['Round', 'Princess', 'Emerald', 'Asscher', 'Oval', 'Radiant', 'Pear', 'Heart', 'Marquise', 'Cushion'], {
    required_error: "Shape is required",
  }),
  carat: z.number().min(0.01, "Carat must be at least 0.01").max(50, "Carat must be less than 50"),
  color: z.enum(['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], {
    required_error: "Color is required",
  }),
  clarity: z.enum(['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'], {
    required_error: "Clarity is required",
  }),
  cut: z.enum(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'], {
    required_error: "Cut is required",
  }),
  polish: z.enum(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']).optional(),
  symmetry: z.enum(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']).optional(),
  fluorescence: z.enum(['None', 'Faint', 'Medium', 'Strong', 'Very Strong']).optional(),
  price: z.number().min(1, "Price must be at least $1"),
  certificateNumber: z.string().optional(),
  lab: z.string().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  depth: z.number().optional(),
  tablePercentage: z.number().min(40).max(80).optional(),
  depthPercentage: z.number().min(40).max(80).optional(),
  certificateUrl: z.string().optional(),
  picture: z.string().optional(),
  status: z.enum(['Available', 'Sold', 'Reserved']).default('Available'),
});

type DiamondFormData = z.infer<typeof diamondSchema>;

interface SingleStoneUploadFormProps {
  initialData?: Partial<DiamondFormData>;
  showScanButton?: boolean;
}

export function SingleStoneUploadForm({ initialData, showScanButton = true }: SingleStoneUploadFormProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { hapticFeedback } = useTelegramWebApp();
  const { triggerInventoryChange } = useInventoryDataSync();

  const form = useForm<DiamondFormData>({
    resolver: zodResolver(diamondSchema),
    defaultValues: {
      stockNumber: '',
      shape: 'Round',
      carat: 1.0,
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      polish: 'Excellent',
      symmetry: 'Excellent',
      fluorescence: 'None',
      price: 5000,
      status: 'Available',
      lab: 'GIA',
      ...initialData,
    },
  });

  // Populate form with scanned data
  useEffect(() => {
    if (initialData) {
      console.log('🔍 Received GIA data:', initialData);
      
      // Map GIA data to form fields with proper validation
      const mappedData: Partial<DiamondFormData> = {
        stockNumber: initialData.stockNumber || `GIA-${Date.now()}`,
        shape: mapGiaShape(initialData.shape),
        carat: Number(initialData.carat) || 1.0,
        color: mapGiaColor(initialData.color),
        clarity: mapGiaClarity(initialData.clarity),
        cut: mapGiaCut(initialData.cut),
        polish: mapGiaGrade(initialData.polish),
        symmetry: mapGiaGrade(initialData.symmetry),
        fluorescence: mapGiaFluorescence(initialData.fluorescence),
        price: Number(initialData.price) || calculateEstimatedPrice(initialData),
        certificateNumber: initialData.certificateNumber,
        lab: initialData.lab || 'GIA',
        length: Number(initialData.length) || undefined,
        width: Number(initialData.width) || undefined,
        depth: Number(initialData.depth) || undefined,
        tablePercentage: Number(initialData.tablePercentage) || undefined,
        depthPercentage: Number(initialData.depthPercentage) || undefined,
        certificateUrl: initialData.certificateUrl,
        picture: initialData.picture,
        status: 'Available',
      };

      console.log('🔍 Mapped data for form:', mappedData);
      
      // Reset form with mapped data
      form.reset(mappedData);
      
      toast({
        title: "✅ GIA Data Loaded",
        description: "Certificate information has been imported successfully",
      });
    }
  }, [initialData, form]);

  // Helper functions to map GIA data to valid form values
  const mapGiaShape = (shape: string | undefined): DiamondFormData['shape'] => {
    if (!shape) return 'Round';
    const shapeMap: Record<string, DiamondFormData['shape']> = {
      'ROUND': 'Round',
      'PRINCESS': 'Princess', 
      'EMERALD': 'Emerald',
      'ASSCHER': 'Asscher',
      'OVAL': 'Oval',
      'RADIANT': 'Radiant',
      'PEAR': 'Pear',
      'HEART': 'Heart',
      'MARQUISE': 'Marquise',
      'CUSHION': 'Cushion',
    };
    return shapeMap[shape.toUpperCase()] || 'Round';
  };

  const mapGiaColor = (color: string | undefined): DiamondFormData['color'] => {
    if (!color) return 'G';
    const validColors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    return validColors.includes(color.toUpperCase()) ? color.toUpperCase() as DiamondFormData['color'] : 'G';
  };

  const mapGiaClarity = (clarity: string | undefined): DiamondFormData['clarity'] => {
    if (!clarity) return 'VS1';
    const validClarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
    return validClarities.includes(clarity.toUpperCase()) ? clarity.toUpperCase() as DiamondFormData['clarity'] : 'VS1';
  };

  const mapGiaCut = (cut: string | undefined): DiamondFormData['cut'] => {
    if (!cut) return 'Excellent';
    const cutMap: Record<string, DiamondFormData['cut']> = {
      'EXCELLENT': 'Excellent',
      'VERY GOOD': 'Very Good',
      'GOOD': 'Good',
      'FAIR': 'Fair',
      'POOR': 'Poor',
    };
    return cutMap[cut.toUpperCase()] || 'Excellent';
  };

  const mapGiaGrade = (grade: string | undefined): 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor' | undefined => {
    if (!grade) return undefined;
    const gradeMap: Record<string, 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor'> = {
      'EXCELLENT': 'Excellent',
      'VERY GOOD': 'Very Good',
      'GOOD': 'Good',
      'FAIR': 'Fair',
      'POOR': 'Poor',
    };
    return gradeMap[grade.toUpperCase()];
  };

  const mapGiaFluorescence = (fluorescence: string | undefined): 'None' | 'Faint' | 'Medium' | 'Strong' | 'Very Strong' | undefined => {
    if (!fluorescence) return 'None';
    const fluorMap: Record<string, 'None' | 'Faint' | 'Medium' | 'Strong' | 'Very Strong'> = {
      'NONE': 'None',
      'FAINT': 'Faint',
      'MEDIUM': 'Medium',
      'STRONG': 'Strong',
      'VERY STRONG': 'Very Strong',
    };
    return fluorMap[fluorescence.toUpperCase()] || 'None';
  };

  const calculateEstimatedPrice = (data: any): number => {
    const carat = Number(data.carat) || 1.0;
    const basePrice = 5000; // Base price per carat
    return Math.round(basePrice * carat);
  };

  const handleScanSuccess = (giaData: any) => {
    console.log('🔍 GIA scan successful:', giaData);
    
    // Map the GIA data properly
    const mappedData = {
      stockNumber: giaData.stockNumber || `GIA-${Date.now()}`,
      shape: mapGiaShape(giaData.shape),
      carat: Number(giaData.carat) || 1.0,
      color: mapGiaColor(giaData.color),
      clarity: mapGiaClarity(giaData.clarity),
      cut: mapGiaCut(giaData.cut),
      polish: mapGiaGrade(giaData.polish),
      symmetry: mapGiaGrade(giaData.symmetry),
      fluorescence: mapGiaFluorescence(giaData.fluorescence),
      price: Number(giaData.price) || calculateEstimatedPrice(giaData),
      certificateNumber: giaData.certificateNumber,
      lab: giaData.lab || 'GIA',
      length: Number(giaData.length) || undefined,
      width: Number(giaData.width) || undefined,
      depth: Number(giaData.depth) || undefined,
      tablePercentage: Number(giaData.table) || undefined,
      depthPercentage: Number(giaData.depth_percentage) || undefined,
      certificateUrl: giaData.certificateUrl || giaData.certificate_url,
      picture: giaData.picture,
    };

    console.log('🔍 Mapped GIA data:', mappedData);
    form.reset(mappedData);
    setIsScanning(false);
    
    hapticFeedback.notification('success');
    toast({
      title: "✅ Certificate Scanned Successfully",
      description: "Diamond data has been imported from GIA certificate",
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    form.setValue('picture', imageUrl);
    toast({
      title: "Image Uploaded",
      description: "Diamond image has been uploaded successfully",
    });
  };

  const onSubmit = async (data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to upload diamonds",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    hapticFeedback.impact('medium');

    try {
      console.log('🔍 Submitting diamond data:', data);
      
      // Prepare data for API
      const diamondData = {
        user_id: user.id,
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: data.carat,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        polish: data.polish || 'Excellent',
        symmetry: data.symmetry || 'Excellent',
        fluorescence: data.fluorescence || 'None',
        price_per_carat: Math.round(data.price / data.carat),
        certificate_number: data.certificateNumber ? parseInt(data.certificateNumber) : null,
        lab: data.lab || 'GIA',
        length: data.length || null,
        width: data.width || null,
        depth: data.depth || null,
        table_percentage: data.tablePercentage || null,
        depth_percentage: data.depthPercentage || null,
        certificate_url: data.certificateUrl || null,
        picture: data.picture || null,
        status: data.status,
        store_visible: true,
      };

      console.log('🔍 Sending to API:', diamondData);

      // Try to submit to FastAPI backend
      const response = await api.addDiamond(apiEndpoints.addDiamond(), diamondData);
      
      if (response.success) {
        triggerInventoryChange();
        
        toast({
          title: "✅ Diamond Added Successfully! 💎",
          description: `${data.shape} diamond ${data.stockNumber} has been added to your inventory and is now visible in the store.`,
        });
        
        // Reset form
        form.reset({
          stockNumber: '',
          shape: 'Round',
          carat: 1.0,
          color: 'G',
          clarity: 'VS1',
          cut: 'Excellent',
          polish: 'Excellent',
          symmetry: 'Excellent',
          fluorescence: 'None',
          price: 5000,
          status: 'Available',
          lab: 'GIA',
        });
        
        hapticFeedback.notification('success');
      } else {
        throw new Error(response.error || 'Failed to add diamond');
      }

    } catch (error) {
      console.error('❌ Error adding diamond:', error);
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to add diamond to inventory',
        variant: "destructive",
      });
      
      hapticFeedback.notification('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Button */}
      {showScanButton && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <Button
              onClick={() => setIsScanning(true)}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-dark hover:to-primary text-primary-foreground font-medium"
            >
              <Camera className="h-5 w-5 mr-2" />
              Scan GIA Certificate
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Diamond Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stockNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter stock number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shape *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shape" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Round">Round</SelectItem>
                          <SelectItem value="Princess">Princess</SelectItem>
                          <SelectItem value="Emerald">Emerald</SelectItem>
                          <SelectItem value="Asscher">Asscher</SelectItem>
                          <SelectItem value="Oval">Oval</SelectItem>
                          <SelectItem value="Radiant">Radiant</SelectItem>
                          <SelectItem value="Pear">Pear</SelectItem>
                          <SelectItem value="Heart">Heart</SelectItem>
                          <SelectItem value="Marquise">Marquise</SelectItem>
                          <SelectItem value="Cushion">Cushion</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Diamond Properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="carat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carat *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].map(color => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clarity *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select clarity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'].map(clarity => (
                            <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cut *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].map(cut => (
                            <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Properties */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="polish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Polish</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select polish" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symmetry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symmetry</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select symmetry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fluorescence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fluorescence</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fluorescence" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['None', 'Faint', 'Medium', 'Strong', 'Very Strong'].map(fluor => (
                            <SelectItem key={fluor} value={fluor}>{fluor}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price and Certificate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter certificate number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <FormLabel>Diamond Image</FormLabel>
                <UserImageUpload
                  onImageUpload={handleImageUpload}
                  isUploading={imageUploading}
                  setIsUploading={setImageUploading}
                />
                {form.watch('picture') && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Image uploaded successfully</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-dark hover:to-primary text-primary-foreground font-medium"
                disabled={uploading || imageUploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Adding Diamond...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Diamond to Inventory
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      <QRCodeScanner
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
