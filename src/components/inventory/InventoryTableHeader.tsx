
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function InventoryTableHeader() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="w-16">Image</TableHead>
        <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Stock #</TableHead>
        <TableHead className="font-semibold text-slate-900 dark:text-slate-100">ID</TableHead>
        <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Shape</TableHead>
        <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-100">Carat</TableHead>
        <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Color</TableHead>
        <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Clarity</TableHead>
        <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Cut</TableHead>
        <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-100">Price</TableHead>
        <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Status</TableHead>
        <TableHead className="w-28 font-semibold text-slate-900 dark:text-slate-100">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
