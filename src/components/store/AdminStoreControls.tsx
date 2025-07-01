
import { useState } from "react";
import { Edit, Trash, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Diamond } from "@/components/inventory/InventoryTable";
import { api, apiEndpoints } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { getAdminTelegramId } from "@/lib/api/secureConfig";
import { useEffect } from "react";

interface AdminStoreControlsProps {
  diamond: Diamond;
  onUpdate: () => void;
  onDelete: () => void;
}

export function AdminStoreControls({ diamond, onUpdate, onDelete }: AdminStoreControlsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminTelegramId, setAdminTelegramId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    price: diamond.price,
    description: '',
    imageUrl: diamond.imageUrl || ''
  });
  const { toast } = useToast();
  const { user, isTelegramEnvironment } = useTelegramAuth();

  useEffect(() => {
    const loadAdminId = async () => {
      const adminId = await getAdminTelegramId();
      setAdminTelegramId(adminId);
    };
    loadAdminId();
  }, []);

  // Security check: Only render controls for verified admin
  const isAdmin = user?.id === adminTelegramId && isTelegramEnvironment;
  
  if (!isAdmin || !adminTelegramId) {
    console.warn('🚫 AdminStoreControls: Unauthorized access attempt');
    return null;
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🔧 Admin edit button clicked for diamond:', diamond.stockNumber);
    setIsEditOpen(true);
  };

  const generateDescription = async () => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a luxury diamond expert. Create an elegant, compelling product description for a diamond. Keep it concise but captivating, highlighting the beauty and quality. Use sophisticated language that appeals to discerning customers.'
            },
            {
              role: 'user',
              content: `Create a product description for a ${diamond.carat} carat ${diamond.shape} diamond with ${diamond.color} color, ${diamond.clarity} clarity, and ${diamond.cut} cut. Stock number: ${diamond.stockNumber}`
            }
          ]
        }
      });

      if (response.data?.generatedText) {
        setFormData(prev => ({ ...prev, description: response.data.generatedText }));
        toast({
          title: "Description Generated",
          description: "AI has created a beautiful description for your diamond",
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: "Error",
        description: "Failed to generate description",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      console.log('🔄 Updating diamond via API endpoint:', diamond.id);
      
      const updateData = {
        price_per_carat: Math.round(formData.price / diamond.carat),
        picture: formData.imageUrl,
        certificate_comment: formData.description
      };

      const endpoint = apiEndpoints.updateDiamond(diamond.id);
      const result = await api.put(endpoint, updateData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Updated",
        description: "Diamond updated successfully via API",
      });
      
      setIsEditOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating diamond via API:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update diamond",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this diamond?')) {
      try {
        console.log('🗑️ Deleting diamond via API endpoint:', diamond.id);
        
        const endpoint = apiEndpoints.deleteDiamond(diamond.id, adminTelegramId);
        const result = await api.delete(endpoint);

        if (result.error) {
          throw new Error(result.error);
        }

        toast({
          title: "Deleted",
          description: "Diamond removed from store via API",
        });
        
        onDelete();
      } catch (error) {
        console.error('Error deleting diamond via API:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete diamond",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditClick}
          className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-red-600 shadow-sm"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Diamond - #{diamond.stockNumber}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/diamond-image.jpg"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="description">Description</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateDescription}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'AI Generate'}
                </Button>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter a compelling description for this diamond..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
