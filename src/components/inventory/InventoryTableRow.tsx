import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Diamond } from "./InventoryTable";
import { Edit, Trash, ImageIcon, Upload, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState, useRef } from "react";

interface InventoryTableRowProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
  onToggleStoreVisibility?: (diamondId: string, visible: boolean) => void;
  onImageUpload?: (diamondId: string, file: File) => void;
}

export function InventoryTableRow({ 
  diamond, 
  onEdit, 
  onDelete, 
  onToggleStoreVisibility,
  onImageUpload 
}: InventoryTableRowProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStoreVisible, setIsStoreVisible] = useState(diamond.status === "Available");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(diamond.id, file);
      toast({
        title: "Image uploaded",
        description: "Diamond image has been updated successfully.",
      });
    }
  };

  const handleStoreToggle = (checked: boolean) => {
    setIsStoreVisible(checked);
    if (onToggleStoreVisibility) {
      onToggleStoreVisibility(diamond.id, checked);
    }
    toast({
      title: checked ? "Shown in store" : "Hidden from store",
      description: `Diamond ${diamond.stockNumber} is now ${checked ? 'visible' : 'hidden'} in the store.`,
    });
  };

  const handleContactSeller = () => {
    // Create Telegram deep link for contacting about this diamond
    const message = `Hi! I'm interested in diamond ${diamond.stockNumber} (${diamond.carat}ct ${diamond.shape}, ${diamond.color}/${diamond.clarity}) priced at $${diamond.price.toLocaleString()}`;
    const encodedMessage = encodeURIComponent(message);
    
    if (window.Telegram?.WebApp) {
      // Use Telegram Web App to open chat
      const telegramUrl = `https://t.me/share/url?url=${encodedMessage}`;
      window.open(telegramUrl, '_blank');
    } else {
      // Fallback for non-Telegram environments
      const telegramUrl = `https://t.me/share/url?url=${encodedMessage}`;
      window.open(telegramUrl, '_blank');
    }
    
    toast({
      title: "Opening Telegram",
      description: `Opening chat for diamond ${diamond.stockNumber}`,
    });
  };

  return (
    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800">
      <TableCell className="w-16">
        <div className="relative group">
          {diamond.imageUrl ? (
            <img 
              src={diamond.imageUrl} 
              alt={`Diamond ${diamond.stockNumber}`}
              className="w-12 h-12 object-cover rounded border border-slate-200 dark:border-slate-600"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-slate-400" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3 w-3" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
        {diamond.stockNumber}
      </TableCell>
      <TableCell className="font-medium text-slate-900 dark:text-slate-100">{diamond.shape}</TableCell>
      <TableCell className="text-right font-medium text-slate-900 dark:text-slate-100">
        {diamond.carat.toFixed(2)}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
          {diamond.color}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
          {diamond.clarity}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
          {diamond.cut}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">
        ${diamond.price.toLocaleString()}
      </TableCell>
      <TableCell>
        <Badge 
          className={`${
            diamond.status === "Available" 
              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200" 
              : diamond.status === "Reserved" 
              ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200" 
              : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-200"
          }`}
          variant="outline"
        >
          {diamond.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Switch
          checked={isStoreVisible}
          onCheckedChange={handleStoreToggle}
          disabled={diamond.status !== "Available"}
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleContactSeller}
            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400"
            title="Contact via Telegram"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(diamond)}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(diamond.id)}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
