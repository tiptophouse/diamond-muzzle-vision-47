
import { useState } from "react";
import { Diamond } from "@/pages/InventoryPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Gem } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface SimpleInventoryTableProps {
  diamonds: Diamond[];
  loading: boolean;
  onRefresh: () => void;
}

export function SimpleInventoryTable({ diamonds, loading, onRefresh }: SimpleInventoryTableProps) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (diamond: Diamond) => {
    if (!user?.id) return;
    
    setDeletingId(diamond.id);
    
    try {
      const response = await api.post('/sold', {
        diamond_id: diamond.id,
        user_id: user.id,
        action: 'delete'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast({
        title: "✅ Success",
        description: "Diamond deleted successfully",
      });
      
      onRefresh();
      
    } catch (error) {
      console.error('Failed to delete diamond:', error);
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "Failed to delete diamond. Please try again.",
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
        <p className="text-gray-600">Your inventory is empty or no diamonds match your search.</p>
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
                  <div className="flex gap-1 mt-1">
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
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(diamond)}
                      disabled={deletingId === diamond.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
