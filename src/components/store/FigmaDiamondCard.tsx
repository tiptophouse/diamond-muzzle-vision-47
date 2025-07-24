import { useState } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Gem, Link2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThreeDViewer } from "./ThreeDViewer";
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints } from "@/lib/api";

interface FigmaDiamondCardProps {
  diamond: Diamond;
  index: number;
  onUpdate: () => void;
}

export function FigmaDiamondCard({ diamond, index, onUpdate }: FigmaDiamondCardProps) {
  const [show3DViewer, setShow3DViewer] = useState(false);
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(diamond.stockNumber);
    toast({
      title: "Stock number copied!",
      description: "Stock number has been copied to clipboard"
    });
  };

  const handleUpdateStoreVisibility = async (visible: boolean) => {
    try {
      const response = await api.put(apiEndpoints.updateStone(diamond.diamondId || diamond.id), {
        store_visible: visible
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "💎 Diamond Updated",
        description: `Diamond ${diamond.stockNumber} is now ${visible ? 'visible' : 'hidden'} in store.`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update diamond visibility",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          #{diamond.stockNumber}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleCopyToClipboard}>
            <Link2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative">
        <AspectRatio ratio={4 / 3}>
          {diamond.imageUrl ? (
            <img
              src={diamond.imageUrl}
              alt={`Diamond ${diamond.stockNumber}`}
              className="object-cover rounded-none"
            />
          ) : (
            <div className="bg-gray-100 flex items-center justify-center">
              <Gem className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </AspectRatio>
        <div className="absolute top-2 left-2">
          {diamond.store_visible ? (
            <Badge className="bg-green-500 text-white">Visible</Badge>
          ) : (
            <Badge variant="secondary">Hidden</Badge>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {diamond.shape} Diamond
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{diamond.carat} Carat</span>
          <span>{diamond.color} / {diamond.clarity}</span>
        </div>
        <p className="text-xl font-bold text-gray-900 mb-3">
          ${diamond.price.toLocaleString()}
        </p>
        <div className="flex items-center justify-between gap-2">
          <Button className="w-1/2" onClick={() => setShow3DViewer(true)}>
            View 3D
          </Button>
          <Button variant="outline" className="w-1/2">
            Enquire
          </Button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => handleUpdateStoreVisibility(!diamond.store_visible)}
          >
            {diamond.store_visible ? 'Hide from Store' : 'Show in Store'}
          </Button>
        </div>
      </div>

      {/* 3D Viewer Modal */}
      <Dialog open={show3DViewer} onOpenChange={setShow3DViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>3D Diamond Viewer - {diamond.stockNumber}</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex-1">
            {diamond.gem360Url && (
              <ThreeDViewer 
                stockNumber={diamond.stockNumber}
                imageUrl={diamond.gem360Url}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
