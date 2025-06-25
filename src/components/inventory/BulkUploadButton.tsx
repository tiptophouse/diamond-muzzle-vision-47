
import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function BulkUploadButton() {
  const navigate = useNavigate();

  return (
    <Button 
      variant="outline" 
      onClick={() => navigate('/upload')}
      className="border-blue-600 text-blue-600 hover:bg-blue-50"
    >
      <Upload className="mr-2 h-4 w-4" />
      Bulk Upload
    </Button>
  );
}
