
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CsvPreviewProps {
  data: any[];
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CsvPreview({ data, fileName, onConfirm, onCancel }: CsvPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview: {fileName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {data.length} rows found
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock Number</TableHead>
                <TableHead>Shape</TableHead>
                <TableHead>Carat</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Clarity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 5).map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.stockNumber || '-'}</TableCell>
                  <TableCell>{row.shape || '-'}</TableCell>
                  <TableCell>{row.carat || '-'}</TableCell>
                  <TableCell>{row.color || '-'}</TableCell>
                  <TableCell>{row.clarity || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Upload {data.length} Diamonds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
