
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-4 h-10">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
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
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No diamonds found. Upload your inventory to get started.
              </TableCell>
            </TableRow>
          ) : (
            data.map((diamond) => (
              <TableRow key={diamond.id} className="hover:bg-muted/50">
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
