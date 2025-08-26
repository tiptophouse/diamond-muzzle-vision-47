
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Diamond } from '@/types/diamond';

interface DiamondFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: Diamond;
  title: string;
}

export function DiamondFormModal({ isOpen, onClose, onSave, initialData, title }: DiamondFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Diamond form content will be implemented here</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
