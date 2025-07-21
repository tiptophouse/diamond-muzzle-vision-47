
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

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
  const [autoMappings, setAutoMappings] = useState<Record<string, string>>({});
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();

  // Smart auto-mapping logic
  useEffect(() => {
    const autoMap: Record<string, string> = {};
    
    const fuzzyMatch = (header: string, targets: string[]) => {
      const headerLower = header.toLowerCase().trim();
      
      for (const target of targets) {
        const targetLower = target.toLowerCase();
        
        // Exact match
        if (headerLower === targetLower) return target;
        
        // Contains match
        if (headerLower.includes(targetLower) || targetLower.includes(headerLower)) {
          return target;
        }
        
        // Special mappings
        const specialMappings: Record<string, string[]> = {
          'Stock#': ['stock', 'sku', 'item', 'id', 'ref'],
          'Shape': ['cut_shape', 'diamond_shape'],
          'Weight': ['carat', 'ct', 'size'],
          'CertNumber': ['cert', 'certificate', 'report'],
          'Price/Crt': ['price', 'ppc', 'per_carat'],
          'Fluo': ['fluorescence', 'fluor'],
          'Symm': ['symmetry', 'sym']
        };
        
        for (const [expectedCol, aliases] of Object.entries(specialMappings)) {
          if (target === expectedCol && aliases.some(alias => 
            headerLower.includes(alias) || alias.includes(headerLower)
          )) {
            return target;
          }
        }
      }
      
      return null;
    };

    headers.forEach(header => {
      const match = fuzzyMatch(header, expectedColumns);
      if (match) {
        autoMap[header] = match;
      }
    });

    setAutoMappings(autoMap);
    setMappings(autoMap);
  }, [headers, expectedColumns]);

  const handleMappingChange = (header: string, expectedColumn: string) => {
    selectionChanged();
    setMappings(prev => {
      if (expectedColumn === 'none') {
        const { [header]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [header]: expectedColumn };
    });
  };

  const applyAutoMappings = () => {
    impactOccurred('medium');
    setMappings(autoMappings);
  };

  const getMappedColumns = () => {
    return Object.values(mappings);
  };

  const getMissingMandatory = () => {
    const mapped = getMappedColumns();
    return mandatoryColumns.filter(col => !mapped.includes(col));
  };

  const getUnmappedHeaders = () => {
    return headers.filter(header => !mappings[header]);
  };

  const canProceed = getMissingMandatory().length === 0;

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{Object.keys(mappings).length}</div>
              <div className="text-xs text-muted-foreground">Mapped Columns</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">{getMissingMandatory().length}</div>
              <div className="text-xs text-muted-foreground">Missing Required</div>
            </div>
          </div>
          
          {Object.keys(autoMappings).length > 0 && (
            <Button 
              variant="outline" 
              onClick={applyAutoMappings}
              className="w-full mt-3 text-xs"
              size="sm"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Apply AI Suggestions ({Object.keys(autoMappings).length})
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Missing Mandatory Columns Alert */}
      {getMissingMandatory().length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Missing Required Columns</p>
                <div className="flex flex-wrap gap-1">
                  {getMissingMandatory().map(col => (
                    <Badge key={col} variant="destructive" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Column Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Map Your Columns</CardTitle>
          <p className="text-sm text-muted-foreground">
            Match your CSV columns to the expected format
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {headers.map(header => {
            const isMapped = mappings[header];
            const isAutoMapped = autoMappings[header];
            
            return (
              <div key={header} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{header}</span>
                      {isAutoMapped && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="w-2 h-2 mr-1" />
                          Auto
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <Select
                      value={mappings[header] || 'none'}
                      onValueChange={(value) => handleMappingChange(header, value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Don't map</SelectItem>
                        {expectedColumns.map(col => {
                          const isAlreadyMapped = Object.values(mappings).includes(col) && mappings[header] !== col;
                          const isMandatory = mandatoryColumns.includes(col);
                          
                          return (
                            <SelectItem 
                              key={col} 
                              value={col}
                              disabled={isAlreadyMapped}
                              className={isMandatory ? 'font-semibold' : ''}
                            >
                              <div className="flex items-center gap-2">
                                {col}
                                {isMandatory && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                {isAlreadyMapped && <span className="text-xs text-muted-foreground">(Used)</span>}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Unmapped Headers */}
      {getUnmappedHeaders().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Unmapped Columns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {getUnmappedHeaders().map(header => (
                <Badge key={header} variant="outline" className="text-xs">
                  {header}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These columns will be ignored during processing
            </p>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {canProceed && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">Ready to Process</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              All required columns are mapped. Tap "Process Mapping" to continue.
            </p>
            <Button 
              onClick={() => onMappingComplete(mappings)} 
              className="w-full mt-3"
              size="sm"
            >
              <ArrowRight className="w-3 h-3 mr-1" />
              Process Mapping
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        {canProceed && (
          <Button onClick={() => onMappingComplete(mappings)} className="flex-1">
            <ArrowRight className="w-4 h-4 mr-2" />
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
