
import { useState } from "react";
import { Diamond } from "@/pages/InventoryPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Gem, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface SimpleInventoryTableProps {
  diamonds: Diamond[];
  loading: boolean;
  onRefresh: () => void;
  onDiamondDeleted?: (diamondId: string) => void;
}

export function SimpleInventoryTable({ 
  diamonds, 
  loading, 
  onRefresh, 
  onDiamondDeleted 
}: SimpleInventoryTableProps) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (diamond: Diamond) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "User not authenticated",
      });
      return;
    }
    
    setDeletingId(diamond.id);
    
    try {
      console.log('🗑️ Deleting diamond:', {
        id: diamond.id,
        stockNumber: diamond.stockNumber,
        userId: user.id
      });

      // Use the correct delete endpoint
      const response = await api.delete(`/api/v1/delete_diamond?diamond_id=${diamond.id}&user_id=${user.id}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Remove from UI immediately on success
      if (onDiamondDeleted) {
        onDiamondDeleted(diamond.id);
      }
      
      toast({
        title: "✅ Success",
        description: `Diamond ${diamond.stockNumber} deleted successfully`,
      });
      
      console.log('✅ Diamond deleted successfully');
      
    } catch (error) {
      console.error('❌ Failed to delete diamond:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to delete diamond. Please try again.";
      
      toast({
        variant: "destructive",
        title: "❌ Delete Failed",
        description: (
          <div className="space-y-2">
            <div>{errorMessage}</div>
            <div className="text-xs bg-red-100 p-2 rounded">
              <strong>Troubleshooting:</strong>
              <ul className="list-disc ml-4 mt-1">
                <li>Check internet connection</li>
                <li>Verify diamond exists in backend</li>
                <li>Try refreshing and retry</li>
              </ul>
            </div>
          </div>
        ),
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="border rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading inventory...</span>
        </div>
      </div>
    );
  }

  if (diamonds.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <Gem className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Diamonds Found</h3>
        <p className="text-gray-600 mb-4">Your inventory is empty or no diamonds match your search.</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Expected ~566 diamonds from FastAPI</p>
              <p>If you should have inventory data, check the connection status above.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carat
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {diamonds.map((diamond) => (
              <tr key={diamond.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {diamond.stockNumber}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {diamond.shape}
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {diamond.color}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {diamond.clarity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {diamond.cut}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {diamond.carat.toFixed(2)} ct
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    ${diamond.price.toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge 
                    className={
                      diamond.status === "Available" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }
                    variant="outline"
                  >
                    {diamond.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(diamond)}
                      disabled={deletingId === diamond.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      title={`Delete ${diamond.stockNumber}`}
                    >
                      {deletingId === diamond.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer with connection status */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {diamonds.length} diamonds</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected to FastAPI Backend</span>
          </div>
        </div>
      </div>
    </div>
  );
}
