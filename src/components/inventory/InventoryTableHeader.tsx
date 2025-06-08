
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function InventoryTableHeader() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent border-slate-200">
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Image</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Stock #</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Shape</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50 text-right">Carat</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Color</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Clarity</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Cut</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50 text-right">Price</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Status</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Store</TableHead>
        <TableHead className="font-semibold text-slate-900 bg-slate-50">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
