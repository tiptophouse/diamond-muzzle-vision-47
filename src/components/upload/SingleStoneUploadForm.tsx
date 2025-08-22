
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Diamond, Plus } from 'lucide-react';

interface SingleStoneUploadFormProps {
  onSuccess: () => void;
}

export function SingleStoneUploadForm({ onSuccess }: SingleStoneUploadFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Diamond className="h-5 w-5" />
          Add Single Diamond
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#0088cc]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-[#0088cc]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Single Diamond Upload</h3>
          <p className="text-muted-foreground mb-4">
            Add individual diamonds to your inventory one at a time
          </p>
          <Button onClick={onSuccess} className="bg-[#0088cc] hover:bg-[#0088cc]/90">
            Start Adding Diamonds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
