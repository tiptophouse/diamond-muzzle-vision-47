
import { useState } from "react";
import { Trash2, Edit, Eye, EyeOff, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Diamond } from "./InventoryTable";

interface EnhancedInventoryActionsProps {
  diamond?: Diamond;
  onAdd?: (diamond: Partial<Diamond>) => Promise<boolean>;
  onEdit?: (stockNumber: string, updates: Partial<Diamond>) => Promise<boolean>;
  onDelete?: (stockNumber: string) => Promise<boolean>;
  onToggleStore?: (stockNumber: string) => Promise<boolean>;
  onUploadImage?: (stockNumber: string, file: File) => Promise<string | null>;
  isAddMode?: boolean;
}

export function EnhancedInventoryActions({
  diamond,
  onAdd,
  onEdit,
  onDelete,
  onToggleStore,
  onUploadImage,
  isAddMode = false
}: EnhancedInventoryActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Diamond>>({
    stockNumber: diamond?.stockNumber || '',
    shape: diamond?.shape || 'Round',
    carat: diamond?.carat || 1,
    color: diamond?.color || 'G',
    clarity: diamond?.clarity || 'VS1',
    cut: diamond?.cut || 'Excellent',
    price: diamond?.price || 1000,
    status: diamond?.status || 'Available',
    store_visible: diamond?.store_visible || false,
  });

  const handleSave = async () => {
    try {
      let success = false;
      
      if (isAddMode) {
        success = await onAdd?.(formData) || false;
      } else if (diamond) {
        success = await onEdit?.(diamond.stockNumber, formData) || false;
      }

      if (success) {
        setIsDialogOpen(false);
        if (isAddMode) {
          setFormData({
            stockNumber: '',
            shape: 'Round',
            carat: 1,
            color: 'G',
            clarity: 'VS1',
            cut: 'Excellent',
            price: 1000,
            status: 'Available',
            store_visible: false,
          });
        }
      }
    } catch (error) {
      console.error('Error saving diamond:', error);
    }
  };

  const handleDelete = async () => {
    if (diamond && confirm('Are you sure you want to delete this diamond?')) {
      await onDelete?.(diamond.stockNumber);
    }
  };

  const handleToggleStore = async () => {
    if (diamond) {
      await onToggleStore?.(diamond.stockNumber);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !diamond) return;

    setUploading(true);
    try {
      await onUploadImage?.(diamond.stockNumber, file);
    } finally {
      setUploading(false);
    }
  };

  if (isAddMode) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Diamond
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Diamond</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stockNumber">Stock Number</Label>
              <Input
                id="stockNumber"
                value={formData.stockNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, stockNumber: e.target.value }))}
                placeholder="D12345"
              />
            </div>
            <div>
              <Label htmlFor="shape">Shape</Label>
              <Select
                value={formData.shape}
                onValueChange={(value) => setFormData(prev => ({ ...prev, shape: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Round">Round</SelectItem>
                  <SelectItem value="Princess">Princess</SelectItem>
                  <SelectItem value="Emerald">Emerald</SelectItem>
                  <SelectItem value="Oval">Oval</SelectItem>
                  <SelectItem value="Marquise">Marquise</SelectItem>
                  <SelectItem value="Pear">Pear</SelectItem>
                  <SelectItem value="Heart">Heart</SelectItem>
                  <SelectItem value="Radiant">Radiant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="carat">Carat</Label>
              <Input
                id="carat"
                type="number"
                step="0.01"
                value={formData.carat}
                onChange={(e) => setFormData(prev => ({ ...prev, carat: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="H">H</SelectItem>
                  <SelectItem value="I">I</SelectItem>
                  <SelectItem value="J">J</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clarity">Clarity</Label>
              <Select
                value={formData.clarity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clarity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FL">FL</SelectItem>
                  <SelectItem value="IF">IF</SelectItem>
                  <SelectItem value="VVS1">VVS1</SelectItem>
                  <SelectItem value="VVS2">VVS2</SelectItem>
                  <SelectItem value="VS1">VS1</SelectItem>
                  <SelectItem value="VS2">VS2</SelectItem>
                  <SelectItem value="SI1">SI1</SelectItem>
                  <SelectItem value="SI2">SI2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Add Diamond
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Store Visibility Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleStore}
        className={`h-8 w-8 p-0 ${
          diamond?.store_visible 
            ? 'text-green-600 hover:bg-green-100' 
            : 'text-gray-400 hover:bg-gray-100'
        }`}
        title={diamond?.store_visible ? 'Hide from store' : 'Show in store'}
      >
        {diamond?.store_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>

      {/* Image Upload */}
      <div className="relative">
        <input
          type="file"
          id={`image-upload-${diamond?.stockNumber}`}
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById(`image-upload-${diamond?.stockNumber}`)?.click()}
          disabled={uploading}
          className="h-8 w-8 p-0"
          title="Upload image"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit diamond">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Diamond - #{diamond?.stockNumber}</DialogTitle>
          </DialogHeader>
          {/* Same form fields as add mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shape">Shape</Label>
              <Select
                value={formData.shape}
                onValueChange={(value) => setFormData(prev => ({ ...prev, shape: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Round">Round</SelectItem>
                  <SelectItem value="Princess">Princess</SelectItem>
                  <SelectItem value="Emerald">Emerald</SelectItem>
                  <SelectItem value="Oval">Oval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="carat">Carat</Label>
              <Input
                id="carat"
                type="number"
                step="0.01"
                value={formData.carat}
                onChange={(e) => setFormData(prev => ({ ...prev, carat: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
        title="Delete diamond"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
