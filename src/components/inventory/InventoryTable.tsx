
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
};

interface InventoryTableProps {
  data: Diamond[];
  loading?: boolean;
}

export function InventoryTable({ data, loading = false }: InventoryTableProps) {
  const isMobile = useIsMobile();

  if (loading) {
    return <InventoryTableLoading />;
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No diamonds found. Upload your inventory to get started.
          </div>
        ) : (
          data.map((diamond) => (
            <InventoryMobileCard key={diamond.id} diamond={diamond} />
          ))
        )}
      </div>
    );
  }
  
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <InventoryTableHeader />
          <TableBody>
            {data.length === 0 ? (
              <InventoryTableEmpty />
            ) : (
              data.map((diamond) => (
                <InventoryTableRow key={diamond.id} diamond={diamond} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
