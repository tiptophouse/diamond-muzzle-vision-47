
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { InventoryTableHeader } from "./InventoryTableHeader";
import { InventoryTableRow } from "./InventoryTableRow";
import { InventoryTableLoading } from "./InventoryTableLoading";
import { InventoryTableEmpty } from "./InventoryTableEmpty";
import { InventoryMobileCard } from "./InventoryMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Diamond {
  id: string;
  diamondId?: string;
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  color_type?: 'Fancy' | 'Standard'; // Add this field to differentiate fancy vs standard
  clarity: string;
  cut: string;
  price: number;
  status: string;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  imageUrl?: string;
  gem360Url?: string;
  store_visible: boolean;
  certificateNumber?: string;
  lab?: string;
  certificateUrl?: string;
  // Add CSV-specific fields
  Image?: string; // CSV Image field
  image?: string; // Alternative image field
  picture?: string; // Another possible image field
  'Video link'?: string; // CSV Video link field
  videoLink?: string; // Alternative video link field
}

interface InventoryTableProps {
  data: Diamond[];
  loading?: boolean;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamond: Diamond) => void;
  onStoreToggle?: (stockNumber: string, isVisible: boolean) => void;
  onImageUpdate?: () => void;
}

export function InventoryTable({ data, loading = false, onEdit, onDelete, onStoreToggle, onImageUpdate }: InventoryTableProps) {
  const isMobile = useIsMobile();

  if (loading) {
    return <InventoryTableLoading />;
  }

  if (isMobile) {
    return (
      <div className="w-full space-y-3 bg-background">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No diamonds found. Upload your inventory to get started.
          </div>
        ) : (
          data.map((diamond) => (
            <InventoryMobileCard 
              key={diamond.id} 
              diamond={diamond} 
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    );
  }
  
  return (
    <div className="w-full rounded-md border overflow-hidden bg-background">
      <div className="w-full overflow-x-auto">
        <Table className="w-full min-w-full">
          <InventoryTableHeader />
          <TableBody>
            {data.length === 0 ? (
              <InventoryTableEmpty />
            ) : (
              data.map((diamond) => (
                <InventoryTableRow 
                  key={diamond.id} 
                  diamond={diamond} 
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStoreToggle={onStoreToggle}
                  onImageUpdate={onImageUpdate}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
