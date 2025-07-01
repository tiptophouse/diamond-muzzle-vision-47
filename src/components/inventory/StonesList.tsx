
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, ExternalLink, Gem } from 'lucide-react';
import { Stone, useStones } from '@/hooks/useStones';
import { StoneDeletionDialog } from './StoneDeletionDialog';

export function StonesList() {
  const { stones, isLoading, isDeletingStone, deleteStone } = useStones();
  const [selectedStone, setSelectedStone] = useState<Stone | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (stone: Stone) => {
    setSelectedStone(stone);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (stoneId: string) => {
    deleteStone(stoneId);
    setIsDeleteDialogOpen(false);
    setSelectedStone(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stones.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <Gem className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Stones Found</h3>
        <p className="text-gray-600 mb-6">
          Your inventory is empty. Add some stones to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {stones.map((stone) => (
          <Card key={stone.id || stone.stock_number} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {stone.stock_number}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {stone.shape} • {stone.weight} ct
                  </p>
                </div>
                <Badge 
                  variant={stone.status === 'available' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {stone.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Color:</span>
                  <span className="ml-1 font-medium">{stone.color}</span>
                </div>
                <div>
                  <span className="text-gray-600">Clarity:</span>
                  <span className="ml-1 font-medium">{stone.clarity}</span>
                </div>
                <div>
                  <span className="text-gray-600">Price/ct:</span>
                  <span className="ml-1 font-medium">${stone.price_per_carat?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <span className="ml-1 font-medium">
                    ${((stone.price_per_carat || 0) * stone.weight).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {stone.certificate_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(stone.certificate_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Certificate
                  </Button>
                )}
                {stone.picture && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(stone.picture, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteClick(stone)}
                  disabled={isDeletingStone}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStone && (
        <StoneDeletionDialog
          stone={selectedStone}
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeletingStone}
        />
      )}
    </>
  );
}
