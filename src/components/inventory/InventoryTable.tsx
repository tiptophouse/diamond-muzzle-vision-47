
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

export type Diamond = {
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
};

interface InventoryTableProps {
  data: Diamond[];
  loading?: boolean;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamondId: string) => void;
  onToggleStoreVisibility?: (diamond: Diamond) => void;
}

export function InventoryTable({ data, loading = false, onEdit, onDelete, onToggleStoreVisibility }: InventoryTableProps) {
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
              onToggleStoreVisibility={onToggleStoreVisibility}
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
                  onToggleStoreVisibility={onToggleStoreVisibility}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
