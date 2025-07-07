import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades, girdleTypes, culetGrades, labOptions, statuses } from '@/components/inventory/form/diamondFormConstants';
import { FloatingLabelInput } from './form/FloatingLabelInput';
import { FloatingLabelSelect } from './form/FloatingLabelSelect';
import { Camera, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";

export function ModernDiamondForm() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addDiamond, isLoading } = useInventoryCrud({
    onSuccess: () => {
      toast({
        title: "✅ Success",
        description: "Diamond has been added to your inventory",
      });
      reset();
      setApiError(null);
    },
    onError: (error: Error) => {
      console.error('❌ Form submission error:', error);
      setApiError(error.message);
      
      // Show specific error toast based on error type
      let title = "❌ Upload Failed";
      let description = error.message;
      
      if (error.message.includes('Network error')) {
        title = "🌐 Connection Error";
      } else if (error.message.includes('Authentication')) {
        title = "🔐 Authentication Error";
      } else if (error.message.includes('Access denied')) {
        title = "🚫 Access Denied";
      } else if (error.message.includes('Invalid data')) {
        title = "📝 Invalid Data";
      } else if (error.message.includes('Server')) {
        title = "⚠️ Server Error";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
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
      storeVisible: true,
      pricePerCarat: 0,
      rapnet: 0,
      rapPercentage: 0,
      length: 0,
      width: 0,
      depth: 0,
      ratio: 1,
      tablePercentage: 60,
      depthPercentage: 62
    }
  });

  const currentShape = watch('shape');
  const currentCarat = watch('carat');
  const currentPricePerCarat = watch('pricePerCarat');
  const showCutField = currentShape === 'Round';

  // Auto-calculate total price when carat or price per carat changes
  React.useEffect(() => {
    if (currentCarat && currentPricePerCarat) {
      setValue('price', currentCarat * currentPricePerCarat);
    }
  }, [currentCarat, currentPricePerCarat, setValue]);

  const handleGiaScanSuccess = (giaData: any) => {
    console.log('GIA data received:', giaData);
    
    // Auto-fill form fields from GIA data
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
    if (giaData.certificate_url) setValue('certificateUrl', giaData.certificate_url);
    if (giaData.certificate_comment) setValue('certificateComment', giaData.certificate_comment);
    
    setIsScanning(false);
    
    toast({
      title: "✅ Certificate Scanned Successfully",
      description: "All diamond information auto-filled from certificate",
    });
  };

  const handleFormSubmit = async (data: DiamondFormData) => {
    console.log('🔍 Form submitted:', data);
    setApiError(null);
    setIsSubmitting(true);
    
    if (!user?.id) {
      const authError = "Please log in to add diamonds";
      setApiError(authError);
      toast({
        title: "🔐 Authentication Error",
        description: authError,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Enhanced validation with specific error messages
    const validationErrors = [];
    if (!data.stockNumber?.trim()) validationErrors.push("Stock Number is required");
    if (!data.carat || data.carat <= 0) validationErrors.push("Valid Carat Weight is required");
    if (!data.pricePerCarat || data.pricePerCarat <= 0) validationErrors.push("Valid Price per Carat is required");
    
    if (validationErrors.length > 0) {
      const validationError = `Validation failed: ${validationErrors.join(', ')}`;
      setApiError(validationError);
      toast({
        title: "📝 Validation Error",
        description: validationError,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await addDiamond(data);
      if (!success) {
        const failError = "Failed to add diamond. Please check your data and try again.";
        setApiError(failError);
        toast({
          title: "❌ Upload Failed",
          description: failError,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset();
    setApiError(null);
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please log in to add diamonds to your inventory.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add Diamond</h1>
            <p className="text-sm text-gray-500 mt-1">Complete all fields to add diamond to inventory</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsScanning(true)}
            className="flex items-center gap-2 h-10 px-3 sm:h-12 sm:px-4"
          >
            <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Scan Certificate</span>
            <span className="sm:hidden">Scan</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Error Display */}
      {apiError && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">Upload Error</h3>
            <p className="text-sm text-red-700">{apiError}</p>
            {apiError.includes('Network error') && (
              <p className="text-xs text-red-600 mt-2">
                💡 Tip: Check your internet connection and ensure the server is running.
              </p>
            )}
            {apiError.includes('401') && (
              <p className="text-xs text-red-600 mt-2">
                💡 Tip: Please log out and log back in to refresh your authentication.
              </p>
            )}
            {apiError.includes('400') && (
              <p className="text-xs text-red-600 mt-2">
                💡 Tip: Please check all required fields are filled correctly.
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 sm:p-6 space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FloatingLabelInput
              id="stockNumber"
              label="Stock Number *"
              {...register('stockNumber', { required: 'Stock number is required' })}
              error={errors.stockNumber?.message}
            />
            
            <FloatingLabelSelect
              id="shape"
              label="Shape *"
              value={watch('shape')}
              options={shapes}
              onValueChange={(value) => setValue('shape', value)}
            />
            
            <FloatingLabelInput
              id="carat"
              label="Carat Weight *"
              type="number"
              step="0.01"
              {...register('carat', { 
                required: 'Carat weight is required',
                min: { value: 0.01, message: 'Carat must be greater than 0' }
              })}
              error={errors.carat?.message}
            />
            
            <FloatingLabelSelect
              id="color"
              label="Color *"
              value={watch('color')}
              options={colors}
              onValueChange={(value) => setValue('color', value)}
            />
            
            <FloatingLabelSelect
              id="clarity"
              label="Clarity *"
              value={watch('clarity')}
              options={clarities}
              onValueChange={(value) => setValue('clarity', value)}
            />
            
            {showCutField && (
              <FloatingLabelSelect
                id="cut"
                label="Cut Grade"
                value={watch('cut')}
                options={cuts}
                onValueChange={(value) => setValue('cut', value)}
              />
            )}
          </div>
        </div>

        {/* Certificate Information Section */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Certificate Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <FloatingLabelSelect
              id="lab"
              label="Laboratory"
              value={watch('lab')}
              options={labOptions}
              onValueChange={(value) => setValue('lab', value)}
            />
            
            <FloatingLabelInput
              id="certificateNumber"
              label="Certificate Number"
              {...register('certificateNumber')}
              error={errors.certificateNumber?.message}
            />
            
            <div className="md:col-span-2">
              <FloatingLabelInput
                id="certificateUrl"
                label="Certificate URL"
                {...register('certificateUrl')}
                error={errors.certificateUrl?.message}
              />
            </div>
            
            <div className="md:col-span-2">
              <FloatingLabelInput
                id="certificateComment"
                label="Certificate Comments"
                {...register('certificateComment')}
                error={errors.certificateComment?.message}
              />
            </div>
          </div>
        </div>

        {/* Physical Measurements Section */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Physical Measurements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <FloatingLabelInput
              id="length"
              label="Length (mm)"
              type="number"
              step="0.01"
              {...register('length', { min: { value: 0, message: 'Length must be positive' } })}
              error={errors.length?.message}
            />
            
            <FloatingLabelInput
              id="width"
              label="Width (mm)"
              type="number"
              step="0.01"
              {...register('width', { min: { value: 0, message: 'Width must be positive' } })}
              error={errors.width?.message}
            />
            
            <FloatingLabelInput
              id="depth"
              label="Depth (mm)"
              type="number"
              step="0.01"
              {...register('depth', { min: { value: 0, message: 'Depth must be positive' } })}
              error={errors.depth?.message}
            />
            
            <FloatingLabelInput
              id="ratio"
              label="L/W Ratio"
              type="number"
              step="0.01"
              {...register('ratio', { min: { value: 0, message: 'Ratio must be positive' } })}
              error={errors.ratio?.message}
            />
          </div>
        </div>

        {/* Grading Details Section */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grading Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FloatingLabelSelect
              id="polish"
              label="Polish"
              value={watch('polish')}
              options={polishGrades}
              onValueChange={(value) => setValue('polish', value)}
            />
            
            <FloatingLabelSelect
              id="symmetry"
              label="Symmetry"
              value={watch('symmetry')}
              options={symmetryGrades}
              onValueChange={(value) => setValue('symmetry', value)}
            />
            
            <FloatingLabelSelect
              id="fluorescence"
              label="Fluorescence"
              value={watch('fluorescence')}
              options={fluorescences}
              onValueChange={(value) => setValue('fluorescence', value)}
            />
            
            <FloatingLabelInput
              id="tablePercentage"
              label="Table %"
              type="number"
              step="0.1"
              {...register('tablePercentage', { 
                min: { value: 0, message: 'Table % must be positive' },
                max: { value: 100, message: 'Table % cannot exceed 100' }
              })}
              error={errors.tablePercentage?.message}
            />
            
            <FloatingLabelInput
              id="depthPercentage"
              label="Depth %"
              type="number"
              step="0.1"
              {...register('depthPercentage', { 
                min: { value: 0, message: 'Depth % must be positive' },
                max: { value: 100, message: 'Depth % cannot exceed 100' }
              })}
              error={errors.depthPercentage?.message}
            />
            
            <FloatingLabelSelect
              id="gridle"
              label="Girdle"
              value={watch('gridle')}
              options={girdleTypes}
              onValueChange={(value) => setValue('gridle', value)}
            />
            
            <FloatingLabelSelect
              id="culet"
              label="Culet"
              value={watch('culet')}
              options={culetGrades}
              onValueChange={(value) => setValue('culet', value)}
            />
          </div>
        </div>

        {/* Pricing Information Section */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FloatingLabelInput
              id="pricePerCarat"
              label="Price per Carat (USD) *"
              type="number"
              step="0.01"
              {...register('pricePerCarat', { 
                required: 'Price per carat is required',
                min: { value: 1, message: 'Price per carat must be greater than 0' }
              })}
              error={errors.pricePerCarat?.message}
            />
            
            <FloatingLabelInput
              id="price"
              label="Total Price (USD)"
              type="number"
              step="0.01"
              {...register('price')}
              error={errors.price?.message}
              readOnly
            />
            
            <FloatingLabelInput
              id="rapnet"
              label="Rapnet"
              type="number"
              {...register('rapnet')}
              error={errors.rapnet?.message}
            />
            
            <FloatingLabelInput
              id="rapPercentage"
              label="Rap %"
              type="number"
              step="0.1"
              {...register('rapPercentage')}
              error={errors.rapPercentage?.message}
            />
            
            <FloatingLabelSelect
              id="status"
              label="Status"
              value={watch('status')}
              options={statuses}
              onValueChange={(value) => setValue('status', value)}
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Diamond Image</h2>
          <FloatingLabelInput
            id="picture"
            label="Image URL"
            {...register('picture')}
            error={errors.picture?.message}
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border">
          <Button 
            type="button"
            variant="outline" 
            onClick={resetForm}
            disabled={isLoading || isSubmitting}
            className="flex-1 h-12 text-base font-medium"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Form
          </Button>
          <Button 
            type="submit"
            disabled={isLoading || isSubmitting}
            className="flex-1 h-12 text-base font-medium"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Adding Diamond..." : "Add Diamond"}
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
