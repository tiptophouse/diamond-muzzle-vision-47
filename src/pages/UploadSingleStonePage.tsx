
import { Layout } from "@/components/layout/Layout";
import { UploadForm } from "@/components/upload/UploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Scan, Camera } from "lucide-react";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useInventoryCrud } from "@/hooks/useInventoryCrud";

export default function UploadSingleStonePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const { toast } = useToast();
  const { addDiamond, isLoading } = useInventoryCrud({
    onSuccess: () => {
      toast({
        title: "✅ Diamond Added Successfully",
        description: "Your diamond has been added to inventory",
      });
      reset(); // Reset form after successful submission
      setFormVisible(false);
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

  const handleScanSuccess = (giaData: any) => {
    console.log('GIA certificate scanned:', giaData);
    setIsScanning(false);
    setFormVisible(true);
    
    // Populate form with scanned data
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
    if (giaData.table) setValue('tablePercentage', Number(giaData.table));
    if (giaData.depth_percentage) setValue('depthPercentage', Number(giaData.depth_percentage));
    if (giaData.certificate_url || giaData.certificateUrl) {
      setValue('certificateUrl', giaData.certificate_url || giaData.certificateUrl);
    }
    
    toast({
      title: "✅ Certificate Scanned Successfully",
      description: "Form populated with scanned data. Review and submit.",
    });
  };

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('Submitting scanned diamond data:', data);
    
    const formattedData = {
      ...data,
      user_id: Date.now(), // This should be replaced with actual user ID
      weight: data.carat,
      stock_number: data.stockNumber,
      certificate_number: data.certificateNumber ? Number(data.certificateNumber) : undefined,
      certificate_url: data.certificateUrl,
      store_visible: data.storeVisible,
      price_per_carat: data.pricePerCarat,
      table_percentage: data.tablePercentage,
      depth_percentage: data.depthPercentage,
    };
    
    addDiamond(formattedData);
  };

  return (
    <Layout>
      <div className="space-y-4 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Upload Inventory</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Scan diamond certificates or upload bulk CSV files
          </p>
        </div>
        
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan" className="flex items-center gap-1 text-xs sm:text-sm">
              <Scan className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Scan Certificate</span>
              <span className="sm:hidden">Scan</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-1 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Bulk CSV Upload</span>
              <span className="sm:hidden">CSV</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan" className="mt-4 space-y-4">
            {/* Scan Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Camera className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">Scan Certificate</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      Use camera to scan diamond certificates
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsScanning(true)}
                    size="lg"
                    className="w-full"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Form - Only show after scanning */}
            {formVisible && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Diamond Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stockNumber" className="text-sm font-medium">Stock Number</Label>
                        <Input
                          id="stockNumber"
                          {...register('stockNumber', { required: true })}
                          className="mt-1"
                          placeholder="Enter stock number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="carat" className="text-sm font-medium">Carat</Label>
                        <Input
                          id="carat"
                          type="number"
                          step="0.01"
                          {...register('carat', { required: true })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Shape & Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shape" className="text-sm font-medium">Shape</Label>
                        <Select value={watch('shape')} onValueChange={(value) => setValue('shape', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Round">Round</SelectItem>
                            <SelectItem value="Princess">Princess</SelectItem>
                            <SelectItem value="Cushion">Cushion</SelectItem>
                            <SelectItem value="Emerald">Emerald</SelectItem>
                            <SelectItem value="Oval">Oval</SelectItem>
                            <SelectItem value="Pear">Pear</SelectItem>
                            <SelectItem value="Marquise">Marquise</SelectItem>
                            <SelectItem value="Heart">Heart</SelectItem>
                            <SelectItem value="Radiant">Radiant</SelectItem>
                            <SelectItem value="Asscher">Asscher</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="color" className="text-sm font-medium">Color</Label>
                        <Select value={watch('color')} onValueChange={(value) => setValue('color', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                            <SelectItem value="G">G</SelectItem>
                            <SelectItem value="H">H</SelectItem>
                            <SelectItem value="I">I</SelectItem>
                            <SelectItem value="J">J</SelectItem>
                            <SelectItem value="K">K</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="M">M</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Clarity & Cut */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clarity" className="text-sm font-medium">Clarity</Label>
                        <Select value={watch('clarity')} onValueChange={(value) => setValue('clarity', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FL">FL</SelectItem>
                            <SelectItem value="IF">IF</SelectItem>
                            <SelectItem value="VVS1">VVS1</SelectItem>
                            <SelectItem value="VVS2">VVS2</SelectItem>
                            <SelectItem value="VS1">VS1</SelectItem>
                            <SelectItem value="VS2">VS2</SelectItem>
                            <SelectItem value="SI1">SI1</SelectItem>
                            <SelectItem value="SI2">SI2</SelectItem>
                            <SelectItem value="I1">I1</SelectItem>
                            <SelectItem value="I2">I2</SelectItem>
                            <SelectItem value="I3">I3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cut" className="text-sm font-medium">Cut</Label>
                        <Select value={watch('cut')} onValueChange={(value) => setValue('cut', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Very Good">Very Good</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Certificate Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="certificateNumber" className="text-sm font-medium">Certificate #</Label>
                        <Input
                          id="certificateNumber"
                          {...register('certificateNumber')}
                          className="mt-1"
                          placeholder="Certificate number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="lab" className="text-sm font-medium">Lab</Label>
                        <Select value={watch('lab')} onValueChange={(value) => setValue('lab', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GIA">GIA</SelectItem>
                            <SelectItem value="AGS">AGS</SelectItem>
                            <SelectItem value="EGL">EGL</SelectItem>
                            <SelectItem value="GSI">GSI</SelectItem>
                            <SelectItem value="IGI">IGI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Polish & Symmetry */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="polish" className="text-sm font-medium">Polish</Label>
                        <Select value={watch('polish')} onValueChange={(value) => setValue('polish', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Very Good">Very Good</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="symmetry" className="text-sm font-medium">Symmetry</Label>
                        <Select value={watch('symmetry')} onValueChange={(value) => setValue('symmetry', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Very Good">Very Good</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Fluorescence */}
                    <div>
                      <Label htmlFor="fluorescence" className="text-sm font-medium">Fluorescence</Label>
                      <Select value={watch('fluorescence')} onValueChange={(value) => setValue('fluorescence', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Faint">Faint</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Strong">Strong</SelectItem>
                          <SelectItem value="Very Strong">Very Strong</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormVisible(false);
                          reset();
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:flex-1"
                      >
                        {isLoading ? "Adding..." : "Add Diamond"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-4">
            <UploadForm />
          </TabsContent>
        </Tabs>

        <QRCodeScanner
          isOpen={isScanning}
          onClose={() => setIsScanning(false)}
          onScanSuccess={handleScanSuccess}
        />
      </div>
    </Layout>
  );
}
