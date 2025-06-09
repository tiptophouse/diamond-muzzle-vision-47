
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiamondFormData, diamondFormSchema } from "@/components/inventory/form/types";
import { DiamondDetailsSection } from "./form/DiamondDetailsSection";
import { FormActions } from "./form/FormActions";
import { ImageUploadManager } from "./ImageUploadManager";
import { Sparkles, Camera } from "lucide-react";

interface SingleStoneFormProps {
  initialData?: Partial<DiamondFormData>;
  onSubmit: (data: DiamondFormData) => void;
  isLoading?: boolean;
}

export function SingleStoneForm({ initialData, onSubmit, isLoading = false }: SingleStoneFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initialData?.additional_images || []
  );

  const form = useForm<DiamondFormData>({
    resolver: zodResolver(diamondFormSchema),
    defaultValues: {
      stockNumber: initialData?.stockNumber || '',
      shape: initialData?.shape || 'Round',
      carat: initialData?.carat || 1,
      color: initialData?.color || 'G',
      clarity: initialData?.clarity || 'VS1',
      cut: initialData?.cut || 'Excellent',
      price: initialData?.price || 5000,
      status: initialData?.status || 'Available',
      fluorescence: initialData?.fluorescence || 'None',
      lab: initialData?.lab || 'GIA',
      polish: initialData?.polish || 'Excellent',
      symmetry: initialData?.symmetry || 'Excellent',
      certificate_number: initialData?.certificate_number || '',
      store_visible: initialData?.store_visible ?? true,
      imageUrl: initialData?.imageUrl || '',
      additional_images: uploadedImages,
    },
  });

  const handleSubmit = (data: DiamondFormData) => {
    // Include uploaded images in the submission
    const enhancedData = {
      ...data,
      imageUrl: uploadedImages[0] || data.imageUrl,
      additional_images: uploadedImages,
    };
    onSubmit(enhancedData);
  };

  const handleImagesUpdate = (images: string[]) => {
    setUploadedImages(images);
    form.setValue('additional_images', images);
    if (images.length > 0 && !form.getValues('imageUrl')) {
      form.setValue('imageUrl', images[0]);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      {/* Premium Image Upload Section */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 hover:border-blue-300 transition-all duration-300">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Diamond Gallery
            </CardTitle>
          </div>
          <p className="text-slate-600">
            Upload high-quality images to showcase your diamond's brilliance
          </p>
        </CardHeader>
        <CardContent>
          <ImageUploadManager
            stockNumber={form.watch('stockNumber') || 'NEW'}
            existingImages={uploadedImages}
            onImagesUpdate={handleImagesUpdate}
            maxImages={8}
          />
        </CardContent>
      </Card>

      {/* Diamond Details Section */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-xl text-slate-900">Diamond Specifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DiamondDetailsSection form={form} />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <FormActions 
        onCancel={() => form.reset()} 
        isLoading={isLoading}
        hasChanges={form.formState.isDirty}
      />
    </form>
  );
}
