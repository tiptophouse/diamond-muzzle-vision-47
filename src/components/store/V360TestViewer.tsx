import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { V360Viewer } from './V360Viewer';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function V360TestViewer() {
  const [testUrl, setTestUrl] = useState('https://v360.in/diamondview.aspx?cid=YBDB&d=T1-0K11005');
  const [showViewer, setShowViewer] = useState(false);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>V360.in Viewer Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test v360.in URL:</label>
          <Input
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter v360.in URL"
          />
        </div>
        
        <Button 
          onClick={() => setShowViewer(!showViewer)}
          className="w-full"
        >
          {showViewer ? 'Hide' : 'Test'} V360 Viewer
        </Button>
        
        {showViewer && testUrl && (
          <div className="border rounded-lg p-4">
            <V360Viewer
              v360Url={testUrl}
              stockNumber="TEST-STONE"
              isInline={true}
              className="w-full h-96"
            />
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Sample URLs to test:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>https://v360.in/diamondview.aspx?cid=YBDB&d=T1-0K11005</li>
            <li>https://v360.in/diamondview.aspx?cid=YBDB&d=R1-0K875562</li>
            <li>https://v360.in/diamondview.aspx?cid=YBDB&d=C1-0K746491</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}