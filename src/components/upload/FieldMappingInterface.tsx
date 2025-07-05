import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, ArrowRight, Sparkles, Upload, RotateCcw } from 'lucide-react';

interface FieldMapping {
  detectedField: string;
  mappedTo: string;
  confidence: number;
}

interface FieldMappingInterfaceProps {
  mappedFields: FieldMapping[];
  unmappedFields: string[];
  onMappingUpdate: (detectedField: string, mappedTo: string) => void;
  onProceed: () => void;
  onBack: () => void;
  isProcessing?: boolean;
}

const AVAILABLE_FIELDS = [
  { value: 'stock', label: 'Stock Number', icon: '🏷️' },
  { value: 'shape', label: 'Shape', icon: '💎' },
  { value: 'weight', label: 'Carat Weight', icon: '⚖️' },
  { value: 'color', label: 'Color Grade', icon: '🌈' },
  { value: 'clarity', label: 'Clarity Grade', icon: '🔍' },
  { value: 'cut', label: 'Cut Grade', icon: '✨' },
  { value: 'price', label: 'Price', icon: '💰' },
  { value: 'lab', label: 'Laboratory', icon: '🏛️' },
  { value: 'certificate_number', label: 'Certificate Number', icon: '📋' },
  { value: 'fluorescence', label: 'Fluorescence', icon: '💡' },
  { value: 'length', label: 'Length', icon: '📏' },
  { value: 'width', label: 'Width', icon: '📐' },
  { value: 'depth', label: 'Depth', icon: '📊' },
  { value: 'table', label: 'Table %', icon: '🔢' },
  { value: 'depth_percentage', label: 'Depth %', icon: '📈' },
  { value: 'girdle', label: 'Girdle', icon: '⭕' },
  { value: 'culet', label: 'Culet', icon: '🔹' },
  { value: 'symmetry', label: 'Symmetry', icon: '⚡' },
  { value: 'polish', label: 'Polish', icon: '✨' },
];

export function FieldMappingInterface({
  mappedFields,
  unmappedFields,
  onMappingUpdate,
  onProceed,
  onBack,
  isProcessing = false
}: FieldMappingInterfaceProps) {
  const [userMappings, setUserMappings] = useState<Record<string, string>>({});
  
  const mappedFieldNames = mappedFields.map(f => f.mappedTo);
  const availableForMapping = AVAILABLE_FIELDS.filter(
    field => !mappedFieldNames.includes(field.value) && !Object.values(userMappings).includes(field.value)
  );

  const handleMapping = (detectedField: string, mappedTo: string) => {
    const newMappings = { ...userMappings };
    
    // Remove any existing mapping for this detected field
    Object.keys(newMappings).forEach(key => {
      if (key === detectedField) {
        delete newMappings[key];
      }
    });
    
    // Add new mapping if not 'ignore'
    if (mappedTo !== 'ignore') {
      newMappings[detectedField] = mappedTo;
    }
    
    setUserMappings(newMappings);
    onMappingUpdate(detectedField, mappedTo);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (confidence >= 0.8) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const successRate = Math.round((mappedFields.length / (mappedFields.length + unmappedFields.length)) * 100);
  const totalMapped = mappedFields.length + Object.keys(userMappings).length;
  const totalFields = mappedFields.length + unmappedFields.length;
  const finalSuccessRate = Math.round((totalMapped / totalFields) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Smart Field Mapping</h2>
        </div>
        <p className="text-muted-foreground">
          We've automatically mapped {mappedFields.length} fields with {successRate}% confidence. 
          Help us map the remaining {unmappedFields.length} fields for perfect data import.
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500"
            style={{ width: `${finalSuccessRate}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{totalMapped} mapped</span>
          <span className="font-medium">{finalSuccessRate}% complete</span>
          <span>{totalFields} total fields</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Successfully Mapped Fields */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Successfully Mapped ({mappedFields.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mappedFields.map((mapping, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="font-medium text-sm">&ldquo;{mapping.detectedField}&rdquo;</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {AVAILABLE_FIELDS.find(f => f.value === mapping.mappedTo)?.icon}
                    </span>
                    <span className="text-sm font-medium">
                      {AVAILABLE_FIELDS.find(f => f.value === mapping.mappedTo)?.label || mapping.mappedTo}
                    </span>
                  </div>
                </div>
                <Badge className={`text-xs ${getConfidenceColor(mapping.confidence)}`}>
                  {Math.round(mapping.confidence * 100)}%
                </Badge>
              </div>
            ))}
            {mappedFields.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No automatic mappings found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unmapped Fields - Manual Mapping */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span>Needs Your Help ({unmappedFields.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {unmappedFields.map((field, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">&ldquo;{field}&rdquo;</div>
                  {userMappings[field] && (
                    <Badge variant="secondary" className="text-xs">
                      Mapped ✓
                    </Badge>
                  )}
                </div>
                <Select
                  value={userMappings[field] || ''}
                  onValueChange={(value) => handleMapping(field, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose field type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ignore" className="text-muted-foreground">
                      🚫 Ignore this field
                    </SelectItem>
                    <Separator className="my-1" />
                    {availableForMapping.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {unmappedFields.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <p className="font-medium text-emerald-600">Perfect! All fields mapped automatically</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Back to Upload
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {finalSuccessRate}% fields mapped • Ready to process {totalMapped} columns
          </div>
          <Button 
            onClick={onProceed} 
            disabled={isProcessing}
            className="px-6"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Process & Upload
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}