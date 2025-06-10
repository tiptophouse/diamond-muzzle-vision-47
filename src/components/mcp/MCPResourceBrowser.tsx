
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMCPClient } from '@/hooks/useMCPClient';
import { MCPResource } from '@/lib/mcp/types';
import { File, Image, FileText, Download, Search, Database } from 'lucide-react';

const getResourceIcon = (mimeType?: string) => {
  if (!mimeType) return <File className="h-4 w-4" />;
  
  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (mimeType.includes('json') || mimeType.includes('text')) return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};

export function MCPResourceBrowser() {
  const { resources, getResource, isConnected } = useMCPClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState<MCPResource | null>(null);
  const [resourceContent, setResourceContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.uri.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResourceSelect = async (resource: MCPResource) => {
    setSelectedResource(resource);
    setIsLoading(true);
    
    try {
      const content = await getResource(resource.uri);
      setResourceContent(content);
    } catch (error) {
      console.error('Failed to load resource:', error);
      setResourceContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (resource: MCPResource) => {
    if (!resourceContent) return;

    const dataStr = JSON.stringify(resourceContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resource.name}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MCP Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connect to MCP server to browse resources</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Resources List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Resources ({resources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.uri}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedResource?.uri === resource.uri
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleResourceSelect(resource)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getResourceIcon(resource.mimeType)}
                      <span className="font-medium">{resource.name}</span>
                      {resource.mimeType && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {resource.mimeType}
                        </Badge>
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-1">{resource.description}</p>
                    )}
                    <p className="text-xs text-blue-600 truncate">{resource.uri}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Resource Viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resource Viewer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedResource ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedResource.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedResource.uri}</p>
                </div>
                {resourceContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedResource)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : resourceContent ? (
                <ScrollArea className="h-[400px]">
                  <div className="p-3 bg-gray-50 rounded border font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
                      {typeof resourceContent === 'string' 
                        ? resourceContent 
                        : JSON.stringify(resourceContent, null, 2)
                      }
                    </pre>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Failed to load resource content
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Select a resource to view its content
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
