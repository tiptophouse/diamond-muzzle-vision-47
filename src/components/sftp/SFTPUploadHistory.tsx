
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSFTPUploadHistory } from '@/hooks/sftp/useSFTPUploadHistory';

export function SFTPUploadHistory() {
  const { uploads, loading, refetch } = useSFTPUploadHistory();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Upload className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      case 'processing':
        return 'secondary' as const;
      case 'invalid':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading upload history...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload History
            </CardTitle>
            <CardDescription>
              Track your SFTP file uploads and processing status
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {uploads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No uploads yet</p>
            <p className="text-sm">Upload CSV files via SFTP to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(upload.status)}
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {upload.filename}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {upload.file_size_bytes && (
                          <span>{(upload.file_size_bytes / 1024 / 1024).toFixed(2)} MB • </span>
                        )}
                        {formatDistanceToNow(new Date(upload.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {upload.status === 'completed' && (
                    <div className="text-sm text-green-600">
                      {upload.diamonds_processed} diamonds processed
                    </div>
                  )}
                  
                  {upload.status === 'failed' && upload.diamonds_failed > 0 && (
                    <div className="text-sm text-red-600">
                      {upload.diamonds_failed} errors
                    </div>
                  )}

                  <Badge variant={getStatusVariant(upload.status)}>
                    {upload.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
