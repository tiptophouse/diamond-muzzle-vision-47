// Diamond Delete Button with Success/Failure Messages
import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useInventoryData } from '@/hooks/useInventoryData';

interface DiamondDeleteButtonProps {
  diamondId: number;
  stockNumber: string;
  onDeleted?: () => void;
}

export function DiamondDeleteButton({ diamondId, stockNumber, onDeleted }: DiamondDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteDiamond } = useInventoryData();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const success = await deleteDiamond(diamondId);
      
      if (success) {
        onDeleted?.();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isDeleting}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="w-[90vw] max-w-md mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Diamond</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete diamond <span className="font-semibold">{stockNumber}</span>? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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