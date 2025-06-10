
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMCPClient } from '@/hooks/useMCPClient';
import { MCPToolsPanel } from './MCPToolsPanel';
import { MCPResourceBrowser } from './MCPResourceBrowser';
import { MCPToolResult } from '@/lib/mcp/types';
import { 
  Workflow, 
  Database, 
  FileText, 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  Power,
  PowerOff
} from 'lucide-react';

export function MCPDashboard() {
  const { 
    session, 
    tools, 
    resources, 
    isConnected, 
    isLoading, 
    initializeSession, 
    disconnect 
  } = useMCPClient();
  
  const [recentResults, setRecentResults] = useState<MCPToolResult[]>([]);

  useEffect(() => {
    // Auto-connect on component mount
    if (!isConnected && !isLoading) {
      initializeSession();
    }
  }, []);

  const handleToolResult = (result: MCPToolResult) => {
    setRecentResults(prev => [result, ...prev.slice(0, 4)]);
  };

  const getStatusColor = () => {
    if (isLoading) return 'yellow';
    if (isConnected) return 'green';
    return 'red';
  };

  const getStatusIcon = () => {
    if (isLoading) return <Activity className="h-4 w-4 animate-spin" />;
    if (isConnected) return <CheckCircle2 className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* MCP Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Model Context Protocol Dashboard
                </CardTitle>
                <p className="text-slate-600">
                  Manage and execute FastAPI diamond inventory tools via MCP
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <Badge variant={getStatusColor() === 'green' ? 'default' : 'destructive'}>
                  {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              
              {isConnected ? (
                <Button variant="outline" onClick={disconnect}>
                  <PowerOff className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button onClick={initializeSession} disabled={isLoading}>
                  <Power className="h-4 w-4 mr-2" />
                  {isLoading ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {session && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Tools Available</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{tools.length}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Resources</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{resources.length}</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Protocol Version</span>
                </div>
                <p className="text-lg font-bold text-purple-600">{session.serverInfo.protocolVersion}</p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Workflow className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Server</span>
                </div>
                <p className="text-lg font-bold text-orange-600">{session.serverInfo.name}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* MCP Interface Tabs */}
      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white">
          <TabsTrigger 
            value="tools" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Tools & Execution
          </TabsTrigger>
          <TabsTrigger 
            value="resources" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Resource Browser
          </TabsTrigger>
          <TabsTrigger 
            value="results" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Recent Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools">
          <MCPToolsPanel onToolResult={handleToolResult} />
        </TabsContent>

        <TabsContent value="resources">
          <MCPResourceBrowser />
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tool Results</CardTitle>
            </CardHeader>
            <CardContent>
              {recentResults.length > 0 ? (
                <div className="space-y-4">
                  {recentResults.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="mb-2">
                        <Badge variant={result.isError ? 'destructive' : 'default'}>
                          {result.isError ? 'Error' : 'Success'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {result.content.map((content, contentIndex) => (
                          <div key={contentIndex} className="p-3 bg-gray-50 rounded">
                            {content.type === 'text' && (
                              <pre className="text-sm whitespace-pre-wrap">{content.text}</pre>
                            )}
                            {content.type === 'resource' && (
                              <p className="text-sm text-blue-600">{content.uri}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No recent results. Execute tools to see results here.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
