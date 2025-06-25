
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DiamondForm } from '@/components/inventory/DiamondForm';
import { useAddDiamond } from '@/hooks/inventory/useAddDiamond';

export function AddDiamondButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { addDiamond } = useAddDiamond(() => {
    setIsOpen(false);
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Diamond
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Diamond</DialogTitle>
        </DialogHeader>
        <DiamondForm
          onSubmit={addDiamond}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
