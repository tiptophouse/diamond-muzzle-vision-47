
import { useState } from "react";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { Camera } from "lucide-react";
import { UploadSuccessCard } from "./UploadSuccessCard";
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades, girdleTypes, culetGrades, labOptions, statuses } from '@/components/inventory/form/diamondFormConstants';
import { useFormValidation } from './form/useFormValidation';

export function SingleStoneUploadForm() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { addDiamond, isLoading } = useInventoryCrud({
    onSuccess: () => {
      console.log('✅ Diamond added successfully, showing success card');
      setUploadSuccess(true);
    }
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiamondFormData>({
    defaultValues: {
      stockNumber: '',
      carat: 1,
      price: 0,
      status: 'Available',
      picture: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      fluorescence: 'None',
      polish: 'Excellent',
      symmetry: 'Excellent',
      lab: 'GIA',
      gridle: 'Medium',
      culet: 'None',
      storeVisible: true
    }
  });

  const { validateFormData, formatFormData } = useFormValidation();

  const handleGiaScanSuccess = (giaData: any) => {
    console.log('GIA data received:', giaData);
    
    // Comprehensive mapping of all GIA data fields including certificate URL
    if (giaData.stock) setValue('stockNumber', giaData.stock);
    if (giaData.shape) setValue('shape', giaData.shape);
    if (giaData.weight) setValue('carat', Number(giaData.weight));
    if (giaData.color) setValue('color', giaData.color);
    if (giaData.clarity) setValue('clarity', giaData.clarity);
    if (giaData.cut) setValue('cut', giaData.cut);
    if (giaData.certificate_number) setValue('certificateNumber', giaData.certificate_number.toString());
    if (giaData.lab) setValue('lab', giaData.lab);
    if (giaData.fluorescence) setValue('fluorescence', giaData.fluorescence);
    if (giaData.polish) setValue('polish', giaData.polish);
    if (giaData.symmetry) setValue('symmetry', giaData.symmetry);
    if (giaData.gridle) setValue('gridle', giaData.gridle);
    if (giaData.culet) setValue('culet', giaData.culet);
    if (giaData.length) setValue('length', Number(giaData.length));
    if (giaData.width) setValue('width', Number(giaData.width));
    if (giaData.depth) setValue('depth', Number(giaData.depth));
    if (giaData.ratio) setValue('ratio', Number(giaData.ratio));
    if (giaData.table_percentage) setValue('tablePercentage', Number(giaData.table_percentage));
    if (giaData.depth_percentage) setValue('depthPercentage', Number(giaData.depth_percentage));
    if (giaData.price_per_carat) setValue('pricePerCarat', Number(giaData.price_per_carat));
    if (giaData.rapnet) setValue('rapnet', Number(giaData.rapnet));
    if (giaData.picture) setValue('picture', giaData.picture);
    
    // Handle certificate URL from uploaded certificate image
    if (giaData.certificate_url || giaData.certificateUrl) {
      setValue('certificateUrl', giaData.certificate_url || giaData.certificateUrl);
      console.log('Certificate image uploaded to:', giaData.certificate_url || giaData.certificateUrl);
    }
    
    if (giaData.certificate_comment) setValue('certificateComment', giaData.certificate_comment);
    
    setIsScanning(false);
    
    toast({
      title: "✅ Certificate Scanned Successfully",
      description: "All diamond information auto-filled and certificate image uploaded",
    });
  };

  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('🔍 UPLOAD: Form submitted', { user: user?.id, data });
    
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      return;
    }

    if (!validateFormData(data)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const formattedData = formatFormData(data, showCutField);
    console.log('🔍 UPLOAD: Calling addDiamond with:', formattedData);
    
    addDiamond(formattedData).then(success => {
      console.log('🔍 UPLOAD: addDiamond result:', success);
      
      if (!success) {
        toast({
          title: "❌ Upload Failed",
          description: "Failed to add diamond to inventory. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const resetForm = () => {
    reset({
      stockNumber: '',
      carat: 1,
      price: 0,
      status: 'Available',
      picture: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      fluorescence: 'None',
      polish: 'Excellent',
      symmetry: 'Excellent',
      lab: 'GIA',
      gridle: 'Medium',
      culet: 'None',
      storeVisible: true
    });
  };

  // Show success card after successful upload
  if (uploadSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <UploadSuccessCard
          title="Stone Uploaded Successfully"
          description="Your diamond has been added to your inventory. Ready to share or continue adding more stones."
          onContinue={() => {
            setUploadSuccess(false);
            resetForm();
          }}
          onShare={() => {
            toast({
              title: "✨ Ready to Share",
              description: "Your diamond is now visible in your store",
            });
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Please log in to add diamonds to your inventory.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Add Diamond</h1>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsScanning(true)}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Scan
        </Button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="stockNumber">Stock Number *</Label>
          <Input
            id="stockNumber"
            {...register('stockNumber', { required: 'Stock number is required' })}
            placeholder="Enter stock number"
          />
          {errors.stockNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.stockNumber.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="shape">Shape</Label>
          <Select onValueChange={(value) => setValue('shape', value)} value={watch('shape')}>
            <SelectTrigger>
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              {shapes.map((shape) => (
                <SelectItem key={shape} value={shape}>{shape}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="carat">Carat Weight *</Label>
          <Input
            id="carat"
            type="number"
            step="0.01"
            {...register('carat', { 
              required: 'Carat is required',
              min: { value: 0.01, message: 'Carat must be greater than 0' }
            })}
            placeholder="Enter carat weight"
          />
          {errors.carat && (
            <p className="text-sm text-red-600 mt-1">{errors.carat.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Select onValueChange={(value) => setValue('color', value)} value={watch('color')}>
            <SelectTrigger>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="clarity">Clarity</Label>
          <Select onValueChange={(value) => setValue('clarity', value)} value={watch('clarity')}>
            <SelectTrigger>
              <SelectValue placeholder="Select clarity" />
            </SelectTrigger>
            <SelectContent>
              {clarities.map((clarity) => (
                <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showCutField && (
          <div>
            <Label htmlFor="cut">Cut</Label>
            <Select onValueChange={(value) => setValue('cut', value)} value={watch('cut')}>
              <SelectTrigger>
                <SelectValue placeholder="Select cut" />
              </SelectTrigger>
              <SelectContent>
                {cuts.map((cut) => (
                  <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="price">Price (USD) *</Label>
          <Input
            id="price"
            type="number"
            {...register('price', { 
              required: 'Price is required',
              min: { value: 1, message: 'Price must be greater than 0' }
            })}
            placeholder="Enter price"
          />
          {errors.price && (
            <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="certificateNumber">Certificate Number</Label>
          <Input
            id="certificateNumber"
            {...register('certificateNumber')}
            placeholder="Enter certificate number"
          />
        </div>

        <div>
          <Label htmlFor="lab">Laboratory</Label>
          <Select onValueChange={(value) => setValue('lab', value)} value={watch('lab')}>
            <SelectTrigger>
              <SelectValue placeholder="Select lab" />
            </SelectTrigger>
            <SelectContent>
              {labOptions.map((lab) => (
                <SelectItem key={lab} value={lab}>{lab}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fluorescence">Fluorescence</Label>
          <Select onValueChange={(value) => setValue('fluorescence', value)} value={watch('fluorescence')}>
            <SelectTrigger>
              <SelectValue placeholder="Select fluorescence" />
            </SelectTrigger>
            <SelectContent>
              {fluorescences.map((fluor) => (
                <SelectItem key={fluor} value={fluor}>{fluor}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="polish">Polish</Label>
          <Select onValueChange={(value) => setValue('polish', value)} value={watch('polish')}>
            <SelectTrigger>
              <SelectValue placeholder="Select polish" />
            </SelectTrigger>
            <SelectContent>
              {polishGrades.map((polish) => (
                <SelectItem key={polish} value={polish}>{polish}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="symmetry">Symmetry</Label>
          <Select onValueChange={(value) => setValue('symmetry', value)} value={watch('symmetry')}>
            <SelectTrigger>
              <SelectValue placeholder="Select symmetry" />
            </SelectTrigger>
            <SelectContent>
              {symmetryGrades.map((symmetry) => (
                <SelectItem key={symmetry} value={symmetry}>{symmetry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={(value) => setValue('status', value)} value={watch('status')}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="storeVisible"
            checked={watch('storeVisible') || false}
            onCheckedChange={(checked) => setValue('storeVisible', checked)}
          />
          <Label htmlFor="storeVisible">Visible in store</Label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={resetForm}
            disabled={isLoading}
            className="flex-1"
          >
            Reset
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Adding..." : "Add Diamond"}
          </Button>
        </div>
      </form>

      <QRCodeScanner
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScanSuccess={handleGiaScanSuccess}
      />
    </div>
  );
}
