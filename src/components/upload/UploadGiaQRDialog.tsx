
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GIACertificateScanner } from "@/components/upload/GIACertificateScanner";

interface UploadGiaQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (giaData: any) => void;
}

export function UploadGiaQRDialog({ open, onOpenChange, onScanSuccess }: UploadGiaQRDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan GIA Certificate QR</DialogTitle>
        </DialogHeader>
        <GIACertificateScanner
          isOpen={open}
          onClose={() => onOpenChange(false)}
          onScanSuccess={onScanSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
