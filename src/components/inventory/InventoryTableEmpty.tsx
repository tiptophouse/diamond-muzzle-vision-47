
import { TableCell, TableRow } from "@/components/ui/table";

export function InventoryTableEmpty() {
  return (
    <TableRow>
      <TableCell colSpan={8} className="h-24 text-center">
        No diamonds found. Upload your inventory to get started.
      </TableCell>
    </TableRow>
  );
}
