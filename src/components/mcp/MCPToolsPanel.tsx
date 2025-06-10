
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMCPClient } from '@/hooks/useMCPClient';
import { MCPTool, MCPToolCall, MCPToolResult } from '@/lib/mcp/types';
import { Play, Database, Search, Plus, Edit, Trash2, BarChart3 } from 'lucide-react';

const toolIcons: Record<string, React.ReactNode> = {
  get_diamonds: <Database className="h-4 w-4" />,
  search_diamonds: <Search className="h-4 w-4" />,
  add_diamond: <Plus className="h-4 w-4" />,
  update_diamond: <Edit className="h-4 w-4" />,
  delete_diamond: <Trash2 className="h-4 w-4" />,
  get_analytics: <BarChart3 className="h-4 w-4" />,
};

interface MCPToolsPanelProps {
  onToolResult?: (result: MCPToolResult) => void;
}

export function MCPToolsPanel({ onToolResult }: MCPToolsPanelProps) {
  const { tools, callTool, isConnected } = useMCPClient();
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<MCPToolResult | null>(null);

  const handleToolSelect = (tool: MCPTool) => {
    setSelectedTool(tool);
    setToolArgs({});
    setLastResult(null);
  };

  const handleArgChange = (argName: string, value: any) => {
    setToolArgs(prev => ({
      ...prev,
      [argName]: value
    }));
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) return;

    setIsExecuting(true);
    try {
      const toolCall: MCPToolCall = {
        name: selectedTool.name,
        arguments: toolArgs
      };

      const result = await callTool(toolCall);
      if (result) {
        setLastResult(result);
        onToolResult?.(result);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const renderArgInput = (argName: string, argSchema: any) => {
    const value = toolArgs[argName] || '';
    
    switch (argSchema.type) {
      case 'string':
        if (argSchema.format === 'textarea') {
          return (
            <Textarea
              value={value}
              onChange={(e) => handleArgChange(argName, e.target.value)}
              placeholder={argSchema.description}
              className="min-h-[80px]"
            />
          );
        }
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleArgChange(argName, e.target.value)}
            placeholder={argSchema.description}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleArgChange(argName, parseFloat(e.target.value) || 0)}
            placeholder={argSchema.description}
          />
        );
      case 'boolean':
        return (
          <select
            value={value.toString()}
            onChange={(e) => handleArgChange(argName, e.target.value === 'true')}
            className="w-full p-2 border rounded"
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </select>
        );
      default:
        return (
          <Input
            type="text"
            value={JSON.stringify(value)}
            onChange={(e) => {
              try {
                handleArgChange(argName, JSON.parse(e.target.value));
              } catch {
                handleArgChange(argName, e.target.value);
              }
            }}
            placeholder={argSchema.description}
          />
        );
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MCP Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connect to MCP server to access tools</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tools List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Available Tools ({tools.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTool?.name === tool.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToolSelect(tool)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {toolIcons[tool.name] || <Play className="h-4 w-4" />}
                    <span className="font-medium">{tool.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {Object.keys(tool.inputSchema.properties || {}).length} args
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Tool Execution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Execute Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTool ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{selectedTool.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{selectedTool.description}</p>
              </div>

              {/* Tool Arguments */}
              {Object.entries(selectedTool.inputSchema.properties || {}).map(([argName, argSchema]: [string, any]) => (
                <div key={argName} className="space-y-2">
                  <Label htmlFor={argName}>
                    {argName}
                    {selectedTool.inputSchema.required?.includes(argName) && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {renderArgInput(argName, argSchema)}
                  {argSchema.description && (
                    <p className="text-xs text-muted-foreground">{argSchema.description}</p>
                  )}
                </div>
              ))}

              <Button
                onClick={handleExecuteTool}
                disabled={isExecuting}
                className="w-full"
              >
                {isExecuting ? 'Executing...' : 'Execute Tool'}
              </Button>

              {/* Tool Result */}
              {lastResult && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Result:</h4>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {lastResult.content.map((content, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded border">
                            {content.type === 'text' && (
                              <pre className="text-sm whitespace-pre-wrap">{content.text}</pre>
                            )}
                            {content.type === 'resource' && (
                              <div>
                                <Badge>Resource</Badge>
                                <p className="text-sm mt-1">{content.uri}</p>
                              </div>
                            )}
                            {content.type === 'image' && content.data && (
                              <img 
                                src={`data:image/jpeg;base64,${content.data}`} 
                                alt="Tool result" 
                                className="max-w-full h-auto rounded"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Select a tool from the list to execute it</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
