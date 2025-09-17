
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Diamond, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DiamondMatch {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price_per_carat: number;
  status: string;
  confidence?: number;
}

interface SimilarDiamondsTableProps {
  diamonds: DiamondMatch[];
  confidenceScore: number;
}

export function SimilarDiamondsTable({ diamonds, confidenceScore }: SimilarDiamondsTableProps) {
  const { toast } = useToast();

  const handleCopyDiamond = (diamond: DiamondMatch) => {
    const diamondText = `${diamond.shape} ${diamond.weight}ct ${diamond.color} ${diamond.clarity} ${diamond.cut || ''} - $${Math.round(diamond.price_per_carat * diamond.weight)} (Stock: ${diamond.stock_number})`.trim();
    
    navigator.clipboard.writeText(diamondText).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `Diamond details copied: ${diamond.stock_number}`,
      });
    });
  };

  const getTotalValue = () => {
    return diamonds.reduce((total, diamond) => {
      const weight = diamond.weight || 0;
      const rawPpc = diamond.price_per_carat || 0;
      let totalPrice = 0;
      if (rawPpc > 100 && rawPpc < 50000 && weight > 0 && weight < 20) {
        totalPrice = Math.round(rawPpc * weight);
      } else if (rawPpc > 0 && rawPpc < 1000000) {
        totalPrice = Math.round(rawPpc);
      } else {
        totalPrice = Math.round(weight * 15000);
      }
      return total + totalPrice;
    }, 0);
  };

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Diamond className="h-5 w-5" />
            Similar Diamonds from Your Stock
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {Math.round(confidenceScore * 100)}% match
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {diamonds.length} matches
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {diamonds.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock #</TableHead>
                    <TableHead>Shape</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Clarity</TableHead>
                    <TableHead>Cut</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diamonds.map((diamond, index) => (
                    <TableRow key={index} className="hover:bg-green-25">
                      <TableCell className="font-medium">{diamond.stock_number}</TableCell>
                      <TableCell>{diamond.shape}</TableCell>
                      <TableCell>{diamond.weight}ct</TableCell>
                      <TableCell>{diamond.color}</TableCell>
                      <TableCell>{diamond.clarity}</TableCell>
                      <TableCell>{diamond.cut || 'N/A'}</TableCell>
                      <TableCell>${Math.round(diamond.price_per_carat * diamond.weight).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={diamond.status === 'Available' ? 'default' : 'secondary'}>
                          {diamond.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyDiamond(diamond)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-white p-3 rounded border border-green-200">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-green-800">Total Portfolio Value:</span>
                <span className="font-bold text-green-900">${getTotalValue().toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Diamond className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No matching diamonds found in your inventory</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
