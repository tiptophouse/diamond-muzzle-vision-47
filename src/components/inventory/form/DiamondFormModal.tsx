
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

  // Convert Diamond to a format compatible with DiamondForm
  const convertInitialData = (): Diamond | Partial<DiamondFormData> | undefined => {
    if (!initialData) return undefined;
    
    // If it's already DiamondFormData, return as is
    if ('storeVisible' in initialData) {
      return initialData as Partial<DiamondFormData>;
    }
    
    // If it's a Diamond object, return it directly since DiamondForm can handle Diamond objects
    return initialData as Diamond;
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
