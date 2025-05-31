
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "./InventoryTable";

interface InventoryTableRowProps {
  diamond: Diamond;
}

export function InventoryTableRow({ diamond }: InventoryTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-mono text-xs font-medium">
        {diamond.stockNumber}
      </TableCell>
      <TableCell className="font-medium">{diamond.shape}</TableCell>
      <TableCell className="text-right font-medium">
        {diamond.carat.toFixed(2)}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {diamond.color}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {diamond.clarity}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {diamond.cut}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-bold">
        ${diamond.price.toLocaleString()}
      </TableCell>
      <TableCell>
        <Badge 
          className={`${
            diamond.status === "Available" 
              ? "bg-green-100 text-green-800 border-green-300" 
              : diamond.status === "Reserved" 
              ? "bg-blue-100 text-blue-800 border-blue-300" 
              : "bg-gray-100 text-gray-800 border-gray-300"
          }`}
          variant="outline"
        >
          {diamond.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
