
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondFormData } from "@/components/inventory/form/types";
import { BasicInfoSection } from "./form/BasicInfoSection";
import { CertificateInfoSection } from "./form/CertificateInfoSection";
import { useSingleStoneValidation } from "./form/useSingleStoneValidation";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { UploadSuccessModal } from "./UploadSuccessModal";
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints } from "@/lib/api";

export function SingleStoneUploadForm() {
  const { user } = useTelegramAuth();
  const { addDiamond, isLoading } = useInventoryCrud();
  const { validateFormData } = useSingleStoneValidation();
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessingGIA, setIsProcessingGIA] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedDiamond, setUploadedDiamond] = useState<any>(null);
  
  // Enhanced form data with all GIA fields
  const [formData, setFormData] = useState({
    stockNumber: '',
    shape: '',
    carat: '',
    color: '',
    clarity: '',
    cut: 'Excellent',
    price: '',
    certificateNumber: '',
    lab: 'GIA',
    
    // Enhanced measurements
    length: '',
    width: '',
    depth: '',
    tablePercentage: '',
    depthPercentage: '',
    ratio: '',
    
    // Additional grades
    polish: '',
    symmetry: '',
    fluorescence: '',
    gridle: '',
    culet: '',
    
    // Additional fields
    certificateUrl: '',
    comments: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScanSuccess = async (giaData: any) => {
    console.log('Complete GIA data received:', giaData);
    setIsProcessingGIA(true);
    
    try {
      // Update form with ALL scanned data
      const updatedFormData = {
        ...formData,
        stockNumber: giaData.stockNumber || giaData.certificateNumber || formData.stockNumber,
        shape: giaData.shape || formData.shape,
        carat: giaData.carat?.toString() || formData.carat,
        color: giaData.color || formData.color,
        clarity: giaData.clarity || formData.clarity,
        cut: giaData.cut || formData.cut,
        certificateNumber: giaData.certificateNumber || formData.certificateNumber,
        price: giaData.price?.toString() || giaData.pricePerCarat ? (giaData.pricePerCarat * giaData.carat).toString() : formData.price,
        lab: giaData.lab || 'GIA',
        
        // Enhanced measurements
        length: giaData.length?.toString() || formData.length,
        width: giaData.width?.toString() || formData.width,
        depth: giaData.depth?.toString() || formData.depth,
        tablePercentage: giaData.tablePercentage?.toString() || formData.tablePercentage,
        depthPercentage: giaData.depthPercentage?.toString() || formData.depthPercentage,
        ratio: giaData.ratio?.toString() || formData.ratio,
        
        // Additional grades
        polish: giaData.polish || formData.polish,
        symmetry: giaData.symmetry || formData.symmetry,
        fluorescence: giaData.fluorescence || formData.fluorescence,
        gridle: giaData.gridle || formData.gridle,
        culet: giaData.culet || formData.culet,
        
        // Additional fields
        certificateUrl: giaData.certificateUrl || formData.certificateUrl,
        comments: giaData.comments || formData.comments
      };
      
      setFormData(updatedFormData);
      setShowScanner(false);
      
      toast({
        title: "Complete GIA Certificate Scanned!",
        description: "All available diamond data has been populated. Review and save to FastAPI database.",
      });

      // Auto-save to FastAPI database with comprehensive data
      if (validateFormData(updatedFormData)) {
        console.log('Auto-saving complete GIA diamond to FastAPI...');
        
        const success = await saveToFastAPI(updatedFormData);
        
        if (success) {
          // Show success modal instead of just resetting
          const uploadedDiamondData = {
            stockNumber: updatedFormData.stockNumber,
            shape: updatedFormData.shape,
            carat: parseFloat(updatedFormData.carat),
            color: updatedFormData.color,
            clarity: updatedFormData.clarity,
            cut: updatedFormData.cut,
            price: parseFloat(updatedFormData.price),
            lab: updatedFormData.lab,
            certificateNumber: updatedFormData.certificateNumber
          };
          
          setUploadedDiamond(uploadedDiamondData);
          setShowSuccessModal(true);
          resetForm();
        }
      }
      
    } catch (error) {
      console.error('Error processing complete GIA scan:', error);
      toast({
        title: "Error Processing GIA Data",
        description: "Failed to process the complete GIA certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingGIA(false);
    }
  };

  const saveToFastAPI = async (data: any): Promise<boolean> => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Prepare comprehensive payload for FastAPI
      const diamondDataPayload = {
        user_id: user.id,
        stock_number: data.stockNumber,
        shape: data.shape,
        weight: parseFloat(data.carat) || 0,
        color: data.color,
        clarity: data.clarity,
        cut: data.cut,
        price_per_carat: data.carat > 0 ? Math.round(parseFloat(data.price) / parseFloat(data.carat)) : Math.round(parseFloat(data.price)),
        status: 'Available',
        certificate_number: data.certificateNumber,
        certificate_url: data.certificateUrl,
        certificate_comment: data.comments,
        lab: data.lab,
        
        // Enhanced measurements and details
        length: parseFloat(data.length) || undefined,
        width: parseFloat(data.width) || undefined,
        depth: parseFloat(data.depth) || undefined,
        ratio: parseFloat(data.ratio) || undefined,
        table_percentage: parseFloat(data.tablePercentage) || undefined,
        depth_percentage: parseFloat(data.depthPercentage) || undefined,
        
        // Additional grades
        fluorescence: data.fluorescence,
        polish: data.polish,
        symmetry: data.symmetry,
        gridle: data.gridle,
        culet: data.culet,
        
        store_visible: true
      };

      // Remove undefined keys
      Object.keys(diamondDataPayload).forEach(key => {
        if (diamondDataPayload[key as keyof typeof diamondDataPayload] === undefined) {
          delete diamondDataPayload[key as keyof typeof diamondDataPayload];
        }
      });
      
      console.log('📤 Sending comprehensive diamond data to FastAPI:', diamondDataPayload);
      
      const endpoint = apiEndpoints.addDiamond();
      const response = await api.post(endpoint, {
        diamond_data: diamondDataPayload
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ FastAPI save successful:', response.data);
      return true;
      
    } catch (error) {
      console.error('❌ FastAPI save failed:', error);
      toast({
        variant: "destructive",
        title: "FastAPI Save Failed",
        description: error instanceof Error ? error.message : "Failed to save to FastAPI database",
      });
      return false;
    }
  };

  const resetForm = () => {
    setFormData({
      stockNumber: '',
      shape: '',
      carat: '',
      color: '',
      clarity: '',
      cut: 'Excellent',
      price: '',
      certificateNumber: '',
      lab: 'GIA',
      length: '',
      width: '',
      depth: '',
      tablePercentage: '',
      depthPercentage: '',
      ratio: '',
      polish: '',
      symmetry: '',
      fluorescence: '',
      gridle: '',
      culet: '',
      certificateUrl: '',
      comments: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add diamonds to your inventory.",
        variant: "destructive",
      });
      return;
    }

    if (!validateFormData(formData)) {
      toast({
        title: "Validation Error", 
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    const success = await saveToFastAPI(formData);
    if (success) {
      // Show success modal with uploaded diamond details
      const uploadedDiamondData = {
        stockNumber: formData.stockNumber,
        shape: formData.shape,
        carat: parseFloat(formData.carat),
        color: formData.color,
        clarity: formData.clarity,
        cut: formData.cut,
        price: parseFloat(formData.price),
        lab: formData.lab,
        certificateNumber: formData.certificateNumber
      };
      
      setUploadedDiamond(uploadedDiamondData);
      setShowSuccessModal(true);
      resetForm();
      
      // Show additional success toast with Hebrew text
      toast({
        title: "🎉 Diamond Uploaded Successfully!",
        description: `Diamond #${formData.stockNumber} has been saved to your FastAPI database | האבן הועלתה בהצלחה למסד הנתונים`,
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Please log in to add diamonds to your inventory.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Add Single Diamond to FastAPI Database
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100"
              disabled={isProcessingGIA}
            >
              <Camera className="h-4 w-4" />
              {isProcessingGIA ? "Processing Complete GIA..." : "Scan Complete GIA Certificate"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <BasicInfoSection formData={formData} onInputChange={handleInputChange} />
            <CertificateInfoSection formData={formData} onInputChange={handleInputChange} />

            {/* Enhanced Measurements Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detailed Measurements & Grades</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Length (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.length}
                    onChange={(e) => handleInputChange('length', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 6.52"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Width (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.width}
                    onChange={(e) => handleInputChange('width', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 6.48"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Depth (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.depth}
                    onChange={(e) => handleInputChange('depth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 4.02"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Table %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tablePercentage}
                    onChange={(e) => handleInputChange('tablePercentage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 57.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Depth %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.depthPercentage}
                    onChange={(e) => handleInputChange('depthPercentage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 61.8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Polish</label>
                  <select
                    value={formData.polish}
                    onChange={(e) => handleInputChange('polish', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Polish</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Symmetry</label>
                  <select
                    value={formData.symmetry}
                    onChange={(e) => handleInputChange('symmetry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Symmetry</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fluorescence</label>
                  <select
                    value={formData.fluorescence}
                    onChange={(e) => handleInputChange('fluorescence', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Fluorescence</option>
                    <option value="None">None</option>
                    <option value="Faint">Faint</option>
                    <option value="Medium">Medium</option>
                    <option value="Strong">Strong</option>
                  </select>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || isProcessingGIA} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-lg font-semibold"
            >
              {isLoading ? "Saving to FastAPI Database..." : "Save Diamond to FastAPI Database"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <QRCodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      <UploadSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        diamond={uploadedDiamond}
      />
    </>
  );
}
