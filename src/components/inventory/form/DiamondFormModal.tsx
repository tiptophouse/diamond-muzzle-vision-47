
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
  const convertedInitialData = initialData ? {
    stockNumber: initialData.stockNumber || '',
    shape: initialData.shape || '',
    carat: initialData.carat || 0,
    color: initialData.color || '',
    clarity: initialData.clarity || '',
    cut: initialData.cut || '',
    price: initialData.price || 0,
    status: initialData.status || 'Available',
    storeVisible: 'store_visible' in initialData ? initialData.store_visible : true,
    certificateNumber: initialData.certificateNumber || '',
    certificateUrl: initialData.certificateUrl || '',
    lab: initialData.lab || '',
    imageUrl: initialData.imageUrl || '',
    gem360Url: initialData.gem360Url || '',
  } as Partial<DiamondFormData> : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DiamondForm
          diamond={convertedInitialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
