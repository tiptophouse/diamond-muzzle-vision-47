
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InventoryTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="font-semibold">Stock #</TableHead>
        <TableHead className="font-semibold">Shape</TableHead>
        <TableHead className="font-semibold">Carat</TableHead>
        <TableHead className="font-semibold">Color</TableHead>
        <TableHead className="font-semibold">Clarity</TableHead>
        <TableHead className="font-semibold">Cut</TableHead>
        <TableHead className="font-semibold">Price</TableHead>
        <TableHead className="font-semibold">Status</TableHead>
        <TableHead className="font-semibold">Store</TableHead>
        <TableHead className="font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
