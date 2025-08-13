
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { useDeleteDiamond } from '@/hooks/useDeleteDiamond';

interface DeleteDiamondButtonProps {
  stockNumber: string;
  onDeleted?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function DeleteDiamondButton({ 
  stockNumber, 
  onDeleted, 
  variant = 'destructive', 
  size = 'sm',
  className = ''
}: DeleteDiamondButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteDiamond, isDeleting } = useDeleteDiamond();

  const handleDelete = async () => {
    const success = await deleteDiamond(stockNumber);
    if (success) {
      setIsOpen(false);
      onDeleted?.();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {size !== 'icon' && (isDeleting ? 'Deleting...' : 'Delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Diamond</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete diamond {stockNumber}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Diamond'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
