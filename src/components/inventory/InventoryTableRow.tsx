
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "./InventoryTable";

interface InventoryTableRowProps {
  diamond: Diamond;
}

export function InventoryTableRow({ diamond }: InventoryTableRowProps) {
  return (
    <TableRow className="hover:bg-slate-50">
      <TableCell className="font-mono text-xs font-medium text-slate-900">
        {diamond.stockNumber}
      </TableCell>
      <TableCell className="font-medium text-slate-900">{diamond.shape}</TableCell>
      <TableCell className="text-right font-medium text-slate-900">
        {diamond.carat.toFixed(2)}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
          {diamond.color}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
          {diamond.clarity}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
          {diamond.cut}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-bold text-slate-900">
        ${diamond.price.toLocaleString()}
      </TableCell>
      <TableCell>
        <Badge 
          className={`${
            diamond.status === "Available" 
              ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
              : diamond.status === "Reserved" 
              ? "bg-blue-100 text-blue-800 border-blue-300" 
              : "bg-slate-100 text-slate-800 border-slate-300"
          }`}
          variant="outline"
        >
          {diamond.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
