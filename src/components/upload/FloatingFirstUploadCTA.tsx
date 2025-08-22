
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventoryData } from '@/hooks/useInventoryData';

export function FloatingFirstUploadCTA() {
  const navigate = useNavigate();
  const { data, isLoading } = useInventoryData();
  const diamonds = data?.diamonds || [];

  if (isLoading || diamonds.length > 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Ready to get started?</p>
              <p className="text-xs opacity-90">Upload your first diamonds</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/upload')}
              className="flex-1 bg-white text-blue-600 hover:bg-gray-100"
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/upload')}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
