import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramSDK2Context } from '@/providers/TelegramSDK2Provider';
import { api, apiEndpoints } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Diamond, Upload, Loader2 } from 'lucide-react';

interface DiamondFormData {
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  price_per_carat: number;
  cut?: string;
  polish?: string;
  symmetry?: string;
  lab?: string;
  certificate_number?: string;
  certificate_comment?: string;
  rapnet?: number;
  picture?: string;
}

const SHAPES = [
  'round brilliant', 'princess', 'cushion', 'oval', 'emerald',
  'pear', 'marquise', 'asscher', 'radiant', 'heart'
];

const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];

const CUTS = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'FAIR', 'POOR'];

const LABS = ['GIA', 'IGI', 'HRD', 'AGS', 'EGL'];

export default function UploadSingleStonePage() {
  const { user } = useTelegramAuth();
  const { webApp } = useTelegramSDK2Context();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DiamondFormData>({
    defaultValues: {
      stock: '',
      shape: '',
      weight: 0,
      color: '',
      clarity: '',
      price_per_carat: 0,
      cut: '',
      polish: '',
      symmetry: '',
      lab: '',
      certificate_number: '',
      certificate_comment: '',
      rapnet: 0,
      picture: '',
    },
  });

  const watchShape = form.watch('shape');

  const onSubmit = async (data: DiamondFormData) => {
    if (!user?.id) {
      toast.error('שגיאה', {
        description: 'משתמש לא מחובר',
      });
      return;
    }

    setIsSubmitting(true);
    webApp?.HapticFeedback?.impactOccurred('medium');

    try {
      // Validate required fields
      if (!data.stock || !data.shape || !data.weight || !data.color || !data.clarity || !data.price_per_carat) {
        toast.error('שדות חובה חסרים', {
          description: 'אנא מלא את כל השדות המסומנים בכוכבית',
        });
        return;
      }

      // Convert weight to number
      const diamondData = {
        ...data,
        weight: Number(data.weight),
        price_per_carat: Number(data.price_per_carat),
        rapnet: data.rapnet ? Number(data.rapnet) : undefined,
        certificate_number: data.certificate_number ? Number(data.certificate_number) : undefined,
      };

      console.log('📤 Submitting diamond:', diamondData);

      const response = await api.post(
        apiEndpoints.addDiamond(user.id),
        diamondData
      );

      if (response.error) {
        const errorMsg = typeof response.error === 'string' 
          ? response.error 
          : (response.error as any)?.message || 'Failed to add diamond';
        throw new Error(errorMsg);
      }

      console.log('✅ Diamond added successfully:', response.data);

      webApp?.HapticFeedback?.notificationOccurred('success');
      
      toast.success('יהלום נוסף בהצלחה!', {
        description: `מק"ט ${data.stock} נוסף למלאי`,
      });

      // Reset form
      form.reset();

      // Navigate to inventory after a short delay
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Failed to add diamond:', error);
      
      webApp?.HapticFeedback?.notificationOccurred('error');
      
      toast.error('שגיאה בהוספת יהלום', {
        description: error.message || 'נסה שוב מאוחר יותר',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TelegramMiniAppLayout>
      <div className="p-4 pb-20">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Diamond className="h-6 w-6 text-primary" />
              הוסף יהלום יחיד
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Stock Number */}
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        מק״ט <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="מק״ט ייחודי"
                          className="bg-background text-foreground border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Shape */}
                <FormField
                  control={form.control}
                  name="shape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        צורה <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background text-foreground border-border">
                            <SelectValue placeholder="בחר צורה" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SHAPES.map(shape => (
                            <SelectItem key={shape} value={shape}>
                              {shape}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Weight/Carat */}
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        משקל (קראט) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          step="0.01"
                          placeholder="1.25"
                          className="bg-background text-foreground border-border"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Color */}
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        צבע <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background text-foreground border-border">
                            <SelectValue placeholder="בחר צבע" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLORS.map(color => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Clarity */}
                <FormField
                  control={form.control}
                  name="clarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        ניקיון <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background text-foreground border-border">
                            <SelectValue placeholder="בחר ניקיון" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLARITIES.map(clarity => (
                            <SelectItem key={clarity} value={clarity}>
                              {clarity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Per Carat */}
                <FormField
                  control={form.control}
                  name="price_per_carat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        מחיר לקראט ($) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          step="0.01"
                          placeholder="5000"
                          className="bg-background text-foreground border-border"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cut (only for round brilliant) */}
                {watchShape === 'round brilliant' && (
                  <FormField
                    control={form.control}
                    name="cut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">חיתוך</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background text-foreground border-border">
                              <SelectValue placeholder="בחר חיתוך" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CUTS.map(cut => (
                              <SelectItem key={cut} value={cut}>
                                {cut}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Polish */}
                <FormField
                  control={form.control}
                  name="polish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">ליטוש</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background text-foreground border-border">
                            <SelectValue placeholder="בחר ליטוש" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUTS.map(polish => (
                            <SelectItem key={polish} value={polish}>
                              {polish}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Symmetry */}
                <FormField
                  control={form.control}
                  name="symmetry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">סימטריה</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background text-foreground border-border">
                            <SelectValue placeholder="בחר סימטריה" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUTS.map(symmetry => (
                            <SelectItem key={symmetry} value={symmetry}>
                              {symmetry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lab */}
                <FormField
                  control={form.control}
                  name="lab"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">מעבדה</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background text-foreground border-border">
                            <SelectValue placeholder="בחר מעבדה" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LABS.map(lab => (
                            <SelectItem key={lab} value={lab}>
                              {lab}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Certificate Number */}
                <FormField
                  control={form.control}
                  name="certificate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">מספר תעודה</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="1234567890"
                          className="bg-background text-foreground border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Picture URL */}
                <FormField
                  control={form.control}
                  name="picture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">קישור לתמונה</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="url"
                          placeholder="https://..."
                          className="bg-background text-foreground border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin ml-2" />
                      מוסיף יהלום...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 ml-2" />
                      הוסף יהלום
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </TelegramMiniAppLayout>
  );
}
