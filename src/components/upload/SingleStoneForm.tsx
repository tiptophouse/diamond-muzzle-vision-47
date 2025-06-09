
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiamondFormData, diamondFormSchema } from "@/components/inventory/form/types";
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
      certificateNumber: initialData?.certificateNumber || initialData?.certificate_number || '',
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

  const handleReset = () => {
    form.reset();
    setUploadedImages([]);
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
        <CardContent className="space-y-4">
          {/* Basic form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stock Number</label>
              <input
                {...form.register('stockNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter stock number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Shape</label>
              <select
                {...form.register('shape')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Round">Round</option>
                <option value="Princess">Princess</option>
                <option value="Emerald">Emerald</option>
                <option value="Oval">Oval</option>
                <option value="Cushion">Cushion</option>
                <option value="Pear">Pear</option>
                <option value="Marquise">Marquise</option>
                <option value="Heart">Heart</option>
                <option value="Radiant">Radiant</option>
                <option value="Asscher">Asscher</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Carat</label>
              <input
                {...form.register('carat', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter carat weight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <select
                {...form.register('color')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
                <option value="H">H</option>
                <option value="I">I</option>
                <option value="J">J</option>
                <option value="K">K</option>
                <option value="L">L</option>
                <option value="M">M</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Clarity</label>
              <select
                {...form.register('clarity')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="FL">FL</option>
                <option value="IF">IF</option>
                <option value="VVS1">VVS1</option>
                <option value="VVS2">VVS2</option>
                <option value="VS1">VS1</option>
                <option value="VS2">VS2</option>
                <option value="SI1">SI1</option>
                <option value="SI2">SI2</option>
                <option value="I1">I1</option>
                <option value="I2">I2</option>
                <option value="I3">I3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <input
                {...form.register('price', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter price"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button 
          type="button"
          variant="outline" 
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Diamond"}
        </Button>
      </div>
    </form>
  );
}
