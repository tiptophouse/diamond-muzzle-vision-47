import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { ReportsFilters } from './ReportsFilters';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'sales' | 'inventory' | 'analytics';
  generatedAt: string;
  size: string;
  status: 'ready' | 'generating' | 'error';
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Monthly Sales Report',
    description: 'Comprehensive sales analysis for the current month',
    type: 'sales',
    generatedAt: '2024-01-15T10:30:00Z',
    size: '2.4 MB',
    status: 'ready'
  },
  {
    id: '2',
    title: 'Inventory Analysis',
    description: 'Current inventory status and recommendations',
    type: 'inventory',
    generatedAt: '2024-01-14T15:45:00Z',
    size: '1.8 MB',
    status: 'ready'
  },
  {
    id: '3',
    title: 'Performance Analytics',
    description: 'Detailed performance metrics and trends',
    type: 'analytics',
    generatedAt: '2024-01-13T09:20:00Z',
    size: '3.2 MB',
    status: 'generating'
  }
];

export function ReportsContent() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [reports] = useState<Report[]>(mockReports);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const filteredReports = reports.filter(report => {
    if (filters.search && !report.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type && report.type !== filters.type) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ready</Badge>;
      case 'generating':
        return <Badge variant="secondary">Generating...</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'sales':
        return <TrendingUp className="h-4 w-4" />;
      case 'inventory':
        return <FileText className="h-4 w-4" />;
      case 'analytics':
        return <Calendar className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <ReportsFilters onFilterChange={handleFilterChange} filters={filters} />
      
      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(report.type)}
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                {getStatusBadge(report.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span>Generated: {new Date(report.generatedAt).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>Size: {report.size}</span>
                </div>
                {report.status === 'ready' && (
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
