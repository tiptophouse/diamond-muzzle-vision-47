
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FastAPITestCard() {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">FastAPI Status</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Test backend connectivity and endpoint functionality
          </div>
          <Button 
            onClick={() => navigate('/admin/fastapi-test')}
            size="sm"
            className="w-full"
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Run Endpoint Tests
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
