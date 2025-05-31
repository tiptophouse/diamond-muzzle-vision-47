
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InventoryTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[120px]">Stock #</TableHead>
        <TableHead>Shape</TableHead>
        <TableHead className="text-right">Carat</TableHead>
        <TableHead>Color</TableHead>
        <TableHead>Clarity</TableHead>
        <TableHead>Cut</TableHead>
        <TableHead className="text-right">Price</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
  );
}
