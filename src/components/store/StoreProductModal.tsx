
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface StoreProductModalProps {
  diamond: any;
  isOpen: boolean;
  onClose: () => void;
}

export function StoreProductModal({ diamond, isOpen, onClose }: StoreProductModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const specifications = [
    { label: 'Shape', value: diamond.shape },
    { label: 'Carat Weight', value: `${diamond.carat} ct` },
    { label: 'Color', value: diamond.color },
    { label: 'Clarity', value: diamond.clarity },
    { label: 'Cut', value: diamond.cut },
    { label: 'Certificate', value: diamond.lab || 'GIA' },
    { label: 'Certificate #', value: diamond.certificateNumber || 'Available upon request' },
  ];

  if (diamond.length) specifications.push({ label: 'Length', value: `${diamond.length} mm` });
  if (diamond.width) specifications.push({ label: 'Width', value: `${diamond.width} mm` });
  if (diamond.depth) specifications.push({ label: 'Depth', value: `${diamond.depth} mm` });
  if (diamond.table_percentage) specifications.push({ label: 'Table %', value: `${diamond.table_percentage}%` });
  if (diamond.depth_percentage) specifications.push({ label: 'Depth %', value: `${diamond.depth_percentage}%` });
  if (diamond.polish) specifications.push({ label: 'Polish', value: diamond.polish });
  if (diamond.symmetry) specifications.push({ label: 'Symmetry', value: diamond.symmetry });
  if (diamond.fluorescence) specifications.push({ label: 'Fluorescence', value: diamond.fluorescence });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {diamond.carat}ct {diamond.shape} Diamond
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diamond Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
              {diamond.imageUrl ? (
                <img
                  src={diamond.imageUrl}
                  alt={`${diamond.shape} Diamond`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 left-4">
                <Badge className={getStatusColor(diamond.status)}>
                  {diamond.status || 'Available'}
                </Badge>
              </div>
            </div>

            {/* Price */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatPrice(diamond.price)}
              </div>
              {diamond.price_per_carat && (
                <div className="text-sm text-gray-600">
                  {formatPrice(diamond.price_per_carat)} per carat
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="space-y-3">
                {specifications.map(({ label, value }, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <span className="text-gray-600">{label}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Contact Actions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Interested in this diamond?</h3>
              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  Contact Us for Pricing
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  Request More Information
                </Button>
                <Button variant="ghost" className="w-full" size="lg">
                  Schedule a Viewing
                </Button>
              </div>
              
              <div className="text-sm text-gray-600 text-center mt-4">
                <p>Call us at <strong>+1 (555) 123-4567</strong></p>
                <p>or email <strong>info@diamondcollection.com</strong></p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
