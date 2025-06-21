
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiamondForm } from "../DiamondForm";
import { Diamond } from "../InventoryTable";
import { DiamondFormData } from "./types";

interface DiamondFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DiamondFormData) => void;
  diamond?: Diamond | null;
  isLoading?: boolean;
  title?: string;
}

export function DiamondFormModal({
  open,
  onClose,
  onSubmit,
  diamond,
  isLoading = false,
  title
}: DiamondFormModalProps) {
  const modalTitle = title || (diamond ? `Edit Diamond - #${diamond.stockNumber}` : "Add New Diamond");

  const handleSubmit = (data: DiamondFormData) => {
    onSubmit(data);
  };

  // Convert Diamond to partial DiamondFormData for editing
  const formData = diamond ? {
    stockNumber: diamond.stockNumber,
    shape: diamond.shape,
    carat: diamond.carat,
    color: diamond.color,
    clarity: diamond.clarity,
    cut: diamond.cut,
    price: diamond.price,
    status: diamond.status,
    storeVisible: diamond.store_visible,
    certificateNumber: diamond.certificateNumber,
    certificateUrl: diamond.certificateUrl,
    lab: diamond.lab,
    picture: diamond.imageUrl,
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        <DiamondForm
          diamond={formData as any}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
