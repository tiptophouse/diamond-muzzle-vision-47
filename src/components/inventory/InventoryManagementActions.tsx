
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, AlertTriangle } from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
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

interface InventoryManagementActionsProps {
  onRefresh?: () => void;
}

export function InventoryManagementActions({ onRefresh }: InventoryManagementActionsProps) {
  const { isLoading, deleteAllInventory, updateAllInventory } = useInventoryManagement();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const handleDeleteAll = async () => {
    const success = await deleteAllInventory();
    if (success && onRefresh) {
      onRefresh();
    }
    setShowDeleteDialog(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      // Process CSV file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        const csvData = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        }).filter(obj => Object.keys(obj).length > 1); // Filter empty rows

        const success = await updateAllInventory(csvData);
        if (success && onRefresh) {
          onRefresh();
        }
      };
      reader.readAsText(file);
    }
    setShowUpdateDialog(false);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="destructive"
        onClick={() => setShowDeleteDialog(true)}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Delete All Stock
      </Button>
      
      <Button
        variant="outline"
        onClick={() => setShowUpdateDialog(true)}
        disabled={isLoading}
        className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
      >
        <Upload className="h-4 w-4" />
        Update Stock
      </Button>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete All Inventory
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete ALL inventory items? This action cannot be undone and will permanently remove all your diamonds from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Stock Dialog */}
      <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update All Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Upload a new CSV file to replace your entire inventory. The new file will overlay the old data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                Choose CSV File
              </label>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
