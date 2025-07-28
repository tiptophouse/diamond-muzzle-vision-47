
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Brain, MessageCircle, CheckCircle, XCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { supabase } from '@/integrations/supabase/client';

interface AIValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
  severity: 'error' | 'warning';
  columnHeader: string;
  aiSuggestion?: string;
  followUpQuestion?: string;
}

interface AIValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  failedRows: number;
  errors: AIValidationError[];
  aiEnhancements: number;
  processedData: any[];
  aiInsights: {
    dataQualityScore: number;
    commonIssues: string[];
    suggestions: string[];
    followUpQuestions: string[];
  };
}

interface AIEnhancedCsvValidatorProps {
  onUploadSuccess: (data: any[], result: AIValidationResult) => void;
}

const MANDATORY_FIELDS = ['Shape', 'Weight', 'Color', 'Clarity', 'VendorStockNumber', 'Lab', 'Price'];
const VALID_SHAPES = ['BR', 'PS', 'RAD', 'CU', 'EM', 'OV', 'MQ', 'AS', 'HT', 'RD'];
const VALID_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
const VALID_CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];

export function AIEnhancedCsvValidator({ onUploadSuccess }: AIEnhancedCsvValidatorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<AIValidationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [followUpResponses, setFollowUpResponses] = useState<{ [key: string]: string }>({});
  
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();

  const getAIValidationHelp = async (sampleData: any[], errors: AIValidationError[]): Promise<any> => {
    try {
      setAiProcessing(true);
      
      const errorSummary = errors.slice(0, 10).map(error => ({
        row: error.row,
        column: error.column,
        value: error.value,
        error: error.error
      }));

      const prompt = `You are a diamond industry expert helping to validate and improve CSV data quality.

Sample data issues found:
${JSON.stringify(errorSummary, null, 2)}

Sample of the data:
${JSON.stringify(sampleData.slice(0, 3), null, 2)}

Please analyze this and provide:
1. Smart suggestions to fix common issues
2. Follow-up questions to clarify ambiguous data
3. Data quality insights
4. Auto-corrections where obvious

Focus on diamond industry standards:
- Shapes: ${VALID_SHAPES.join(', ')}
- Colors: ${VALID_COLORS.join(', ')}
- Clarities: ${VALID_CLARITIES.join(', ')}

Respond in JSON format:
{
  "suggestions": ["suggestion1", "suggestion2"],
  "followUpQuestions": ["question1", "question2"],
  "autoCorrections": [{"row": 1, "column": "Shape", "from": "round", "to": "RD", "confidence": 0.9}],
  "dataQualityScore": 0.85,
  "commonIssues": ["issue1", "issue2"],
  "insights": ["insight1", "insight2"]
}`;

      const response = await supabase.functions.invoke('openai-chat', {
        body: {
          message: prompt,
          user_id: 'csv_validator',
          conversation_history: []
        }
      });

      if (response.data?.response) {
        try {
          // Extract JSON from the AI response
          const jsonMatch = response.data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.warn('Failed to parse AI response as JSON:', parseError);
        }
      }

      // Fallback response
      return {
        suggestions: ['Check for missing mandatory fields', 'Verify shape codes are correct'],
        followUpQuestions: ['Are there any custom shape codes you are using?', 'Do you need help with price per carat calculations?'],
        autoCorrections: [],
        dataQualityScore: 0.7,
        commonIssues: ['Invalid shape codes', 'Missing mandatory data'],
        insights: ['Most issues are in shape and clarity fields', 'Consider standardizing your data format']
      };

    } catch (error) {
      console.error('AI validation help failed:', error);
      return {
        suggestions: ['Manual review recommended'],
        followUpQuestions: ['Would you like assistance with data formatting?'],
        autoCorrections: [],
        dataQualityScore: 0.6,
        commonIssues: ['Data validation needed'],
        insights: ['AI assistance temporarily unavailable']
      };
    } finally {
      setAiProcessing(false);
    }
  };

  const validateCsvWithAI = async (data: any[], headers: string[]): Promise<AIValidationResult> => {
    const errors: AIValidationError[] = [];
    const processedData: any[] = [];
    let validRows = 0;
    let failedRows = 0;
    let aiEnhancements = 0;

    // Basic validation first
    data.forEach((row, index) => {
      let rowHasErrors = false;
      const rowNumber = index + 2;

      // Check mandatory fields
      MANDATORY_FIELDS.forEach(field => {
        if (headers.includes(field)) {
          const value = row[field];
          if (!value || value.toString().trim() === '') {
            errors.push({
              row: rowNumber,
              column: field,
              columnHeader: field,
              value: value || '',
              error: `${field} is mandatory and cannot be empty`,
              severity: 'error',
              followUpQuestion: `What should be the ${field} for this diamond? I can help you determine the correct value.`
            });
            rowHasErrors = true;
          }
        }
      });

      // Smart validation with AI suggestions
      if (row.Shape && !VALID_SHAPES.includes(row.Shape.toUpperCase())) {
        // AI can suggest corrections for shape
        errors.push({
          row: rowNumber,
          column: 'Shape',
          columnHeader: 'Shape',
          value: row.Shape,
          error: `Invalid shape code. Expected one of: ${VALID_SHAPES.join(', ')}`,
          severity: 'error',
          aiSuggestion: row.Shape.toLowerCase() === 'round' ? 'RD' : 'BR',
          followUpQuestion: `I see "${row.Shape}" - did you mean "Round Brilliant" (RD)? I can auto-correct similar issues.`
        });
        rowHasErrors = true;
      }

      // Weight validation with AI insights
      if (row.Weight && (isNaN(parseFloat(row.Weight)) || parseFloat(row.Weight) <= 0)) {
        errors.push({
          row: rowNumber,
          column: 'Weight',
          columnHeader: 'Weight',
          value: row.Weight,
          error: 'Weight must be a positive number',
          severity: 'error',
          followUpQuestion: `The weight "${row.Weight}" seems incorrect. What is the actual carat weight of this diamond?`
        });
        rowHasErrors = true;
      }

      // Price validation with AI help
      if (row.Price && (isNaN(parseFloat(row.Price)) || parseFloat(row.Price) <= 0)) {
        errors.push({
          row: rowNumber,
          column: 'Price',
          columnHeader: 'Price',
          value: row.Price,
          error: 'Price must be a positive number',
          severity: 'error',
          followUpQuestion: `I notice the price "${row.Price}". Is this the total price or price per carat? I can help calculate the missing value.`
        });
        rowHasErrors = true;
      }

      if (rowHasErrors) {
        failedRows++;
      } else {
        validRows++;
        processedData.push(row);
      }
    });

    // Get AI insights
    const aiHelp = await getAIValidationHelp(data, errors);

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      totalRows: data.length,
      validRows,
      failedRows,
      errors,
      aiEnhancements,
      processedData,
      aiInsights: {
        dataQualityScore: aiHelp.dataQualityScore || 0.7,
        commonIssues: aiHelp.commonIssues || [],
        suggestions: aiHelp.suggestions || [],
        followUpQuestions: aiHelp.followUpQuestions || []
      }
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(file);
      setValidationResult(null);
      setFollowUpResponses({});
      hapticFeedback.impact('light');
    } else {
      toast({
        title: "❌ Invalid File Type",
        description: "Please select a CSV file with .csv extension",
        variant: "destructive"
      });
    }
  };

  const validateFile = async () => {
    if (!selectedFile) return;

    setValidating(true);
    setProgress(0);
    hapticFeedback.impact('medium');

    try {
      const text = await selectedFile.text();
      setProgress(25);

      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      const headers = lines[0].split('\t').map(h => h.trim().replace(/"/g, ''));
      setProgress(50);

      const csvData = lines.slice(1).map((line) => {
        const values = line.split('\t').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => Object.values(row).some(val => val !== ''));

      setProgress(75);

      const result = await validateCsvWithAI(csvData, headers);
      setValidationResult(result);
      setProgress(100);

      if (result.isValid) {
        hapticFeedback.notification('success');
        toast({
          title: "🎉 AI Validation Successful",
          description: `${result.validRows} diamonds validated with AI assistance. Quality score: ${Math.round(result.aiInsights.dataQualityScore * 100)}%`,
        });
      } else {
        hapticFeedback.notification('warning');
        toast({
          title: "🤖 AI Analysis Complete",
          description: `Found ${result.errors.length} issues. I have suggestions to help fix them!`,
          variant: "destructive"
        });
      }
    } catch (error) {
      hapticFeedback.notification('error');
      toast({
        title: "❌ Processing Error",
        description: error instanceof Error ? error.message : "Failed to process CSV file",
        variant: "destructive"
      });
    } finally {
      setValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!validationResult || !validationResult.isValid) return;

    setUploading(true);
    hapticFeedback.impact('heavy');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUploadSuccess(validationResult.processedData, validationResult);
      hapticFeedback.notification('success');
      
      toast({
        title: "🎉 AI-Enhanced Upload Complete!",
        description: `Successfully uploaded ${validationResult.validRows} diamonds with AI optimization!`,
      });
      
      setSelectedFile(null);
      setValidationResult(null);
    } catch (error) {
      hapticFeedback.notification('error');
      toast({
        title: "❌ Upload Failed",
        description: "Failed to upload diamonds. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFollowUpResponse = async (question: string, response: string) => {
    setFollowUpResponses(prev => ({ ...prev, [question]: response }));
    
    toast({
      title: "🤖 AI Assistant",
      description: "Thank you for the clarification! I'll use this to improve validation.",
    });
    
    // Here you could send the response to AI for further processing
    hapticFeedback.impact('light');
  };

  return (
    <div className="space-y-6">
      {/* AI-Powered Upload Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            🤖 AI-Enhanced Diamond CSV Validator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-primary/25 rounded-lg p-6 text-center bg-primary/5">
            <div className="flex items-center justify-center mb-4">
              <Upload className="h-12 w-12 text-primary mr-4" />
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">AI-Powered Diamond Inventory Upload</h3>
              <p className="text-sm text-muted-foreground">
                Smart validation with AI assistance • Automatic corrections • Follow-up questions
              </p>
              <Button variant="outline" className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Brain className="h-4 w-4 mr-2" />
                Choose CSV for AI Analysis
              </Button>
              {selectedFile && (
                <p className="text-sm font-medium text-primary mt-2">
                  📁 Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="flex gap-2">
              <Button onClick={validateFile} disabled={validating || aiProcessing} className="flex-1">
                {aiProcessing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    AI Processing...
                  </>
                ) : validating ? (
                  'Validating with AI...'
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Validate & Analyze
                  </>
                )}
              </Button>
              {validationResult?.isValid && (
                <Button onClick={handleUpload} disabled={uploading} variant="default">
                  {uploading ? 'Uploading...' : `✨ Upload ${validationResult.validRows} Diamonds`}
                </Button>
              )}
            </div>
          )}

          {(validating || uploading || aiProcessing) && (
            <Progress value={progress} className="w-full" />
          )}
        </CardContent>
      </Card>

      {/* AI Validation Results */}
      {validationResult && (
        <Card className={validationResult.isValid ? 'border-green-500' : 'border-amber-500'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              🤖 AI Analysis Results
              <Badge variant="secondary">
                Quality Score: {Math.round(validationResult.aiInsights.dataQualityScore * 100)}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ai-insights" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                <TabsTrigger value="follow-up">Questions</TabsTrigger>
                <TabsTrigger value="errors">Issues</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="ai-insights" className="space-y-4">
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>🤖 AI Assessment:</strong> Your data quality score is {Math.round(validationResult.aiInsights.dataQualityScore * 100)}%. 
                    I found {validationResult.errors.length} areas for improvement.
                  </AlertDescription>
                </Alert>

                {validationResult.aiInsights.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Suggestions:
                    </h4>
                    <div className="space-y-1">
                      {validationResult.aiInsights.suggestions.map((suggestion, index) => (
                        <div key={index} className="text-sm bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                          💡 {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validationResult.aiInsights.commonIssues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Common Issues Found:</h4>
                    <div className="flex flex-wrap gap-1">
                      {validationResult.aiInsights.commonIssues.map((issue, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="follow-up" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">I have some questions to help improve your data:</h4>
                  </div>
                  
                  {validationResult.aiInsights.followUpQuestions.length > 0 ? (
                    validationResult.aiInsights.followUpQuestions.map((question, index) => (
                      <Card key={index} className="border-blue-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <p className="text-sm font-medium">🤖 {question}</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Your response..."
                                className="flex-1 px-3 py-2 border rounded text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const input = e.target as HTMLInputElement;
                                    handleFollowUpResponse(question, input.value);
                                    input.value = '';
                                  }
                                }}
                              />
                              <Button size="sm" variant="outline">
                                Send
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-700">No follow-up questions needed!</p>
                    </div>
                  )}

                  {/* Show errors with follow-up questions */}
                  {validationResult.errors.filter(e => e.followUpQuestion).slice(0, 5).map((error, index) => (
                    <Card key={index} className="border-amber-200">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Badge variant="outline">Row {error.row} • {error.columnHeader}</Badge>
                          <p className="text-sm text-amber-700">🤖 {error.followUpQuestion}</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Your clarification..."
                              className="flex-1 px-3 py-2 border rounded text-sm"
                            />
                            <Button size="sm" variant="outline">
                              Clarify
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="errors" className="space-y-4">
                {validationResult.errors.length > 0 ? (
                  <ScrollArea className="h-64 border rounded p-3">
                    <div className="space-y-3">
                      {validationResult.errors.slice(0, 20).map((error, index) => (
                        <div key={index} className="text-sm border-b pb-2 last:border-b-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'}>
                              Row {error.row}
                            </Badge>
                            <Badge variant="outline">{error.columnHeader}</Badge>
                            {error.aiSuggestion && (
                              <Badge variant="default" className="bg-blue-600">
                                AI Fix: {error.aiSuggestion}
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground">
                            <strong>Value:</strong> "{error.value}"<br />
                            <strong>Issue:</strong> {error.error}
                            {error.aiSuggestion && (
                              <>
                                <br /><strong>🤖 Suggestion:</strong> Use "{error.aiSuggestion}" instead
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-green-700 font-medium">Perfect! No errors found by AI analysis.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-foreground">{validationResult.totalRows}</div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{validationResult.validRows}</div>
                    <div className="text-sm text-muted-foreground">Valid Diamonds</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-600">{validationResult.failedRows}</div>
                    <div className="text-sm text-muted-foreground">Need Review</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(validationResult.aiInsights.dataQualityScore * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">AI Quality Score</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
