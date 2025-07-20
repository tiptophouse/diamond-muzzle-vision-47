import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

interface CsvColumnMapperProps {
  headers: string[];
  expectedColumns: string[];
  mandatoryColumns: string[];
  onMappingComplete: (mappings: Record<string, string>) => void;
  onBack: () => void;
}

export function CsvColumnMapper({ 
  headers, 
  expectedColumns, 
  mandatoryColumns, 
  onMappingComplete, 
  onBack 
}: CsvColumnMapperProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({});

  useEffect(() => {
    // Auto-map columns with exact matches
    const autoMappings: Record<string, string> = {};
    
    headers.forEach(header => {
      const exactMatch = expectedColumns.find(expected => 
        header.toLowerCase().replace(/[^a-z0-9]/g, '') === 
        expected.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      
      if (exactMatch) {
        autoMappings[header] = exactMatch;
      }
    });

    setMappings(autoMappings);
  }, [headers, expectedColumns]);

  const handleMappingChange = (sourceColumn: string, targetColumn: string) => {
    setMappings(prev => ({
      ...prev,
      [sourceColumn]: targetColumn
    }));
  };

  const getMappedMandatory = () => {
    return mandatoryColumns.filter(col => 
      Object.values(mappings).includes(col)
    );
  };

  const getUnmappedMandatory = () => {
    return mandatoryColumns.filter(col => 
      !Object.values(mappings).includes(col)
    );
  };

  const canProceed = () => {
    return getMappedMandatory().length === mandatoryColumns.length;
  };

  const handleProceed = () => {
    if (canProceed()) {
      onMappingComplete(mappings);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Map Your Columns</CardTitle>
          <p className="text-sm text-muted-foreground">
            Match your CSV columns to the expected format. All mandatory columns must be mapped.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mandatory Columns Status */}
          <div className="space-y-2">
            <h4 className="font-medium">Mandatory Columns Status</h4>
            <div className="flex flex-wrap gap-2">
              {mandatoryColumns.map(col => {
                const isMapped = Object.values(mappings).includes(col);
                return (
                  <Badge 
                    key={col} 
                    variant={isMapped ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {isMapped ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {col}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Column Mappings */}
          <div className="space-y-3">
            <h4 className="font-medium">Column Mappings</h4>
            <div className="grid gap-3">
              {headers.map(header => (
                <div key={header} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{header}</span>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="flex-1">
                    <Select
                      value={mappings[header] || ''}
                      onValueChange={(value) => handleMappingChange(header, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Don't map</SelectItem>
                        {expectedColumns.map(col => {
                          const isUsed = Object.values(mappings).includes(col) && mappings[header] !== col;
                          return (
                            <SelectItem 
                              key={col} 
                              value={col}
                              disabled={isUsed}
                            >
                              <span className="flex items-center gap-2">
                                {col}
                                {mandatoryColumns.includes(col) && (
                                  <Badge variant="outline" className="text-xs">Required</Badge>
                                )}
                                {isUsed && (
                                  <Badge variant="secondary" className="text-xs">Used</Badge>
                                )}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unmapped Mandatory Columns Warning */}
          {getUnmappedMandatory().length > 0 && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded">
              <AlertTriangle className="w-4 h-4" />
              <span>
                Please map the following mandatory columns: {getUnmappedMandatory().join(', ')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </Button>
        <Button 
          onClick={handleProceed}
          disabled={!canProceed()}
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  );
}