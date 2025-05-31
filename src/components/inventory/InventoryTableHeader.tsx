
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InventoryTableHeader() {
  return (
    <TableHeader>
      <TableRow className="bg-slate-100">
        <TableHead className="w-[120px] font-semibold text-slate-700">Stock #</TableHead>
        <TableHead className="font-semibold text-slate-700">Shape</TableHead>
        <TableHead className="text-right font-semibold text-slate-700">Carat</TableHead>
        <TableHead className="font-semibold text-slate-700">Color</TableHead>
        <TableHead className="font-semibold text-slate-700">Clarity</TableHead>
        <TableHead className="font-semibold text-slate-700">Cut</TableHead>
        <TableHead className="text-right font-semibold text-slate-700">Price</TableHead>
        <TableHead className="font-semibold text-slate-700">Status</TableHead>
      </TableRow>
    </TableHeader>
  );
}
