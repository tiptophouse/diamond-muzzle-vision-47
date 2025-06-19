
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiamondForm } from "./DiamondForm";
import { Diamond } from "./InventoryTable";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  diamond?: Diamond | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function InventoryModal({
  isOpen,
  onClose,
  title,
  diamond,
  onSubmit,
  isLoading
}: InventoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DiamondForm
          diamond={diamond}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
