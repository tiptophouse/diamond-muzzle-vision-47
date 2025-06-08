
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface LuxuryProductModalProps {
  diamond: any;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseClick: () => void;
}

export function LuxuryProductModal({ diamond, isOpen, onClose, onPurchaseClick }: LuxuryProductModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const specifications = [
    { label: 'Carat Weight', value: `${diamond.carat} ct` },
    { label: 'Shape', value: diamond.shape },
    { label: 'Color', value: diamond.color },
    { label: 'Clarity', value: diamond.clarity },
    { label: 'Cut', value: diamond.cut },
    { label: 'Lab', value: diamond.lab },
    { label: 'Stock Number', value: diamond.stockNumber },
  ];

  if (diamond.certificateNumber) {
    specifications.push({ label: 'Certificate', value: diamond.certificateNumber });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-slate-900">
            {diamond.carat} ct {diamond.shape} Diamond
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Image Section */}
          <div className="space-y-4">
            <AspectRatio ratio={1}>
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                {diamond.imageUrl ? (
                  <img
                    src={diamond.imageUrl}
                    alt={`${diamond.shape} Diamond`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                    <span className="text-slate-600 text-2xl">💎</span>
                  </div>
                )}
              </div>
            </AspectRatio>
            
            {diamond.lab && (
              <div className="flex justify-center">
                <Badge className="bg-slate-100 text-slate-700 border-slate-300 px-4 py-2">
                  Certified by {diamond.lab}
                </Badge>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Price */}
            <div>
              <div className="text-3xl font-light text-slate-900 mb-2">
                {formatPrice(diamond.price)}
              </div>
              <p className="text-slate-600">
                Exceptional quality diamond ready for purchase
              </p>
            </div>

            <Separator className="bg-slate-200" />

            {/* Specifications */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {specifications.map((spec) => (
                  <div key={spec.label}>
                    <div className="text-sm text-slate-500 mb-1">{spec.label}</div>
                    <div className="font-medium text-slate-900">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Purchase Section */}
            <div className="space-y-4">
              <Button
                onClick={onPurchaseClick}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 text-lg transition-all duration-200 hover:shadow-lg"
              >
                Contact Seller - Purchase Now
              </Button>
              
              <p className="text-sm text-slate-500 text-center">
                Clicking purchase will open a direct chat with the seller
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
