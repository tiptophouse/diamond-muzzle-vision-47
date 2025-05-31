
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { InventoryTableHeader } from "./InventoryTableHeader";
import { InventoryTableRow } from "./InventoryTableRow";
import { InventoryTableLoading } from "./InventoryTableLoading";
import { InventoryTableEmpty } from "./InventoryTableEmpty";

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
  if (loading) {
    return <InventoryTableLoading />;
  }
  
  return (
    <div className="rounded-md border">
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
  );
}
