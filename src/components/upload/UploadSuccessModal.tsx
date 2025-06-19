
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Eye, Package, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UploadedDiamond {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  lab?: string;
  certificateNumber?: string;
}

interface UploadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  diamond: UploadedDiamond;
}

export function UploadSuccessModal({ isOpen, onClose, diamond }: UploadSuccessModalProps) {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleViewInventory = () => {
    onClose();
    navigate('/inventory');
  };

  const handleViewStore = () => {
    onClose();
    navigate('/store');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Diamond Uploaded Successfully!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success Animation */}
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 animate-scale-in">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              אבן הועלתה בהצלחה!
            </p>
            <p className="text-sm text-gray-600">
              Diamond uploaded successfully to FastAPI database
            </p>
          </div>

          {/* Diamond Details Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900">
                  #{diamond.stockNumber}
                </h3>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shape:</span>
                    <span className="font-semibold">{diamond.shape}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carat:</span>
                    <span className="font-semibold">{diamond.carat}ct</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-semibold">{diamond.color}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clarity:</span>
                    <span className="font-semibold">{diamond.clarity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cut:</span>
                    <span className="font-semibold">{diamond.cut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-blue-600">{formatPrice(diamond.price)}</span>
                  </div>
                </div>
              </div>

              {diamond.lab && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Certified by {diamond.lab}</span>
                    {diamond.certificateNumber && (
                      <span className="font-mono">#{diamond.certificateNumber}</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleViewInventory}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              <Package className="h-4 w-4 mr-2" />
              View in Inventory
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              onClick={handleViewStore}
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              View in Store
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Continue Adding Diamonds
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
