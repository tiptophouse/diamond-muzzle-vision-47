
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InventoryTableHeader() {
  return (
    <TableHeader>
      <TableRow className="bg-slate-100 dark:bg-slate-800">
        <TableHead className="w-16"></TableHead>
        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Stock #</TableHead>
        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Shape</TableHead>
        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Carat</TableHead>
        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Color</TableHead>
        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Clarity</TableHead>
        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Cut</TableHead>
        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Price</TableHead>
        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Store</TableHead>
        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
