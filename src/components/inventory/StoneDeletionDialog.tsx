
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Stone } from '@/hooks/useStones';

interface StoneDeletionDialogProps {
  stone: Stone;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (stoneId: string) => void;
  isDeleting: boolean;
}

export function StoneDeletionDialog({ 
  stone, 
  isOpen, 
  onOpenChange, 
  onConfirm, 
  isDeleting 
}: StoneDeletionDialogProps) {
  const handleConfirm = () => {
    onConfirm(stone.id || stone.stock_number);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md mx-4">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">Delete Stone</AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                Are you sure you want to delete this stone? This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Stock Number:</span>
            <span className="text-sm font-medium">{stone.stock_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Shape:</span>
            <span className="text-sm font-medium">{stone.shape}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Weight:</span>
            <span className="text-sm font-medium">{stone.weight} ct</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Color:</span>
            <span className="text-sm font-medium">{stone.color}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Clarity:</span>
            <span className="text-sm font-medium">{stone.clarity}</span>
          </div>
        </div>

        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto" disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Stone
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
