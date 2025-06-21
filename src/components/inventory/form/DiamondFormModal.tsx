
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiamondForm } from "../DiamondForm";
import { DiamondFormData } from "./types";

interface DiamondFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DiamondFormData) => Promise<boolean>;
  title: string;
  initialData?: Partial<DiamondFormData>;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DiamondForm
          diamond={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
