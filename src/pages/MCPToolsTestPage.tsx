import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { listMCPTools, callMCPTool } from '@/lib/mcp-client';
import { useToast } from '@/hooks/use-toast';

export default function MCPToolsTestPage() {
  const [tools, setTools] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleListTools = async () => {
    setLoading(true);
    try {
      const response = await listMCPTools();
      
      if (response.success) {
        setTools(response.data);
        toast({
          title: "✅ MCP Tools Retrieved",
          description: `Found ${response.data?.result?.tools?.length || 0} tools`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "❌ Error",
          description: response.error || "Failed to list MCP tools",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "💥 Exception",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">FastAPI MCP Tools</h1>
          <p className="text-muted-foreground">
            Test connection to FastAPI MCP endpoint at api.mazalbot.com/mcp/messages
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connection Test</CardTitle>
            <CardDescription>
              Click to fetch available tools from FastAPI MCP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleListTools} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Tools...
                </>
              ) : (
                'List MCP Tools'
              )}
            </Button>
          </CardContent>
        </Card>

        {tools && (
          <Card>
            <CardHeader>
              <CardTitle>Available Tools</CardTitle>
              <CardDescription>
                {tools.result?.tools?.length || 0} tools found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tools.result?.tools?.map((tool: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {tool.description}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">Tool</Badge>
                      </div>
                    </CardHeader>
                    {tool.inputSchema && (
                      <CardContent>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-medium mb-2">Input Schema:</p>
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(tool.inputSchema, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tools && (
          <Card>
            <CardHeader>
              <CardTitle>Raw Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(tools, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
