
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiamondForm } from "../DiamondForm";
import { DiamondFormData } from "./types";
import { Diamond } from "../InventoryTable";

interface DiamondFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DiamondFormData) => Promise<boolean>;
  title: string;
  initialData?: Partial<DiamondFormData> | Diamond;
  isLoading?: boolean;
}

export function DiamondFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  isLoading = false,
}: DiamondFormModalProps) {
  const handleSubmit = async (data: DiamondFormData) => {
    const success = await onSubmit(data);
    if (success) {
      onClose();
    }
  };

  // Convert Diamond to DiamondFormData if needed
  const convertInitialData = (): Partial<DiamondFormData> | undefined => {
    if (!initialData) return undefined;
    
    // If it's already DiamondFormData, return as is
    if ('storeVisible' in initialData) {
      return initialData as Partial<DiamondFormData>;
    }
    
    // Convert Diamond to DiamondFormData
    const diamond = initialData as Diamond;
    return {
      stockNumber: diamond.stockNumber || '',
      shape: diamond.shape || '',
      carat: diamond.carat || 0,
      color: diamond.color || '',
      clarity: diamond.clarity || '',
      cut: diamond.cut || '',
      price: diamond.price || 0,
      status: diamond.status || 'Available',
      storeVisible: diamond.store_visible ?? true,
      certificateNumber: diamond.certificateNumber || '',
      certificateUrl: diamond.certificateUrl || '',
      lab: diamond.lab || '',
      imageUrl: diamond.imageUrl || '',
      gem360Url: diamond.gem360Url || '',
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DiamondForm
          diamond={convertInitialData()}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
