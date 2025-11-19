/**
 * Example component showing proper usage of diamond CRUD hooks
 * This demonstrates the correct way to create, update, and delete diamonds
 * using the FastAPI-integrated hooks
 */

import { useState } from 'react';
import { useCreateDiamond, useUpdateDiamond, useDeleteDiamond } from '@/hooks/api/useDiamonds';
import { extractDiamondId } from '@/api/diamondTransformers';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from './InventoryTable';
import { Button } from '@/components/ui/button';

export function DiamondCrudExample() {
  const { user } = useTelegramAuth();
  const createDiamond = useCreateDiamond();
  const updateDiamond = useUpdateDiamond();
  const deleteDiamond = useDeleteDiamond();

  // Example: Create a new diamond
  const handleCreate = () => {
    if (!user?.id) return;

    const newDiamondData = {
      stockNumber: 'ABC123',
      shape: 'Round',
      carat: 1.5,
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      polish: 'Excellent',
      symmetry: 'Excellent',
      fluorescence: 'None',
      certificateNumber: '123456789',
      lab: 'GIA',
      pricePerCarat: 5000,
      // ... other fields
    };

    createDiamond.mutate(
      { data: newDiamondData, userId: user.id },
      {
        onSuccess: (response) => {
          console.log('✅ Diamond created:', response);
        },
        onError: (error) => {
          console.error('❌ Failed to create diamond:', error);
        },
      }
    );
  };

  // Example: Update an existing diamond
  const handleUpdate = (diamond: Diamond) => {
    if (!user?.id) return;

    // Extract the integer diamond_id from the diamond object
    const diamondId = extractDiamondId(diamond);
    
    if (!diamondId) {
      console.error('❌ Cannot update: Invalid diamond ID');
      return;
    }

    const updates = {
      pricePerCarat: 5500, // Update price
      storeVisible: true,  // Make visible in store
      // Only include fields you want to update
    };

    updateDiamond.mutate(
      { diamondId, data: updates, userId: user.id },
      {
        onSuccess: (response) => {
          console.log('✅ Diamond updated:', response);
        },
        onError: (error) => {
          console.error('❌ Failed to update diamond:', error);
        },
      }
    );
  };

  // Example: Delete a diamond
  const handleDelete = (diamond: Diamond) => {
    if (!user?.id) return;

    // Extract the integer diamond_id from the diamond object
    const diamondId = extractDiamondId(diamond);
    
    if (!diamondId) {
      console.error('❌ Cannot delete: Invalid diamond ID');
      return;
    }

    if (confirm(`Delete diamond ${diamond.stockNumber}?`)) {
      deleteDiamond.mutate(
        { diamondId, userId: user.id },
        {
          onSuccess: (response) => {
            console.log('✅ Diamond deleted:', response);
          },
          onError: (error) => {
            console.error('❌ Failed to delete diamond:', error);
          },
        }
      );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Diamond CRUD Example</h2>
      
      <div className="space-y-2">
        <Button 
          onClick={handleCreate}
          disabled={createDiamond.isPending}
        >
          {createDiamond.isPending ? 'Creating...' : 'Create Diamond'}
        </Button>

        {/* Update and Delete buttons would be used with specific diamond objects */}
        <p className="text-sm text-muted-foreground">
          Update and Delete operations require a diamond object with diamond_id
        </p>
      </div>
    </div>
  );
}
