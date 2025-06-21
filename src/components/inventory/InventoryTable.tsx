
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
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  imageUrl?: string;
  store_visible?: boolean;
  certificateNumber?: string;
  lab?: string;
  gem360Url?: string;
  certificateUrl?: string;
}

interface InventoryTableProps {
  diamonds: Diamond[];
  loading?: boolean;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (stockNumber: string) => void;
  onStoreToggle?: (stockNumber: string, isVisible: boolean) => void;
}

export function InventoryTable({ diamonds, loading = false, onEdit, onDelete, onStoreToggle }: InventoryTableProps) {
  const isMobile = useIsMobile();

  if (loading) {
    return <InventoryTableLoading />;
  }

  if (isMobile) {
    return (
      <div className="w-full space-y-3 bg-background">
        {diamonds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No diamonds found. Upload your inventory to get started.
          </div>
        ) : (
          diamonds.map((diamond) => (
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
            {diamonds.length === 0 ? (
              <InventoryTableEmpty />
            ) : (
              diamonds.map((diamond) => (
                <InventoryTableRow 
                  key={diamond.id} 
                  diamond={diamond} 
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStoreToggle={onStoreToggle}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
