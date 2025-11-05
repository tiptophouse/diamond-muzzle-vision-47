import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { processCsvAndImport } from '@/utils/bulkUserImport';
import { useToast } from '@/hooks/use-toast';

export function BulkUserImporter() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [result, setResult] = useState<{
    totalInCsv: number;
    existingUsers: number;
    missingUsers: number;
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload a CSV file',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const importResult = await processCsvAndImport(
        file,
        (phase, current, total) => {
          setCurrentPhase(phase);
          setProgress(current);
        }
      );

      setResult(importResult);

      if (importResult.imported > 0) {
        toast({
          title: 'Import successful',
          description: `Successfully imported ${importResult.imported} new users`,
        });
      } else if (importResult.missingUsers === 0) {
        toast({
          title: 'No new users',
          description: 'All users from the CSV are already in the database',
        });
      } else {
        toast({
          title: 'Import failed',
          description: `Failed to import users. Check the error details.`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk User Import
        </CardTitle>
        <CardDescription>
          Upload a CSV file to automatically import missing users into the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            disabled={isProcessing}
            onClick={() => document.getElementById('csv-upload')?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Select CSV File'}
          </Button>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{currentPhase}</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>Total users in CSV:</strong> {result.totalInCsv}</p>
                  <p><strong>Already in database:</strong> {result.existingUsers}</p>
                  <p><strong>Missing users found:</strong> {result.missingUsers}</p>
                </div>
              </AlertDescription>
            </Alert>

            {result.imported > 0 && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Successfully imported {result.imported} users</strong>
                </AlertDescription>
              </Alert>
            )}

            {result.failed > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Failed to import {result.failed} users</strong></p>
                    {result.errors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="font-semibold">Errors:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {result.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {result.missingUsers === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All users from the CSV are already in the database. No import needed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <p className="font-semibold mb-1">CSV Format Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Column 2: telegram_id (required)</li>
              <li>Column 3: language_code (optional)</li>
              <li>Column 4: first_name (optional)</li>
              <li>Column 5: last_name (optional)</li>
              <li>Column 6: phone_number (optional)</li>
            </ul>
            <p className="mt-2">All imported users will be set as <strong>free users</strong> by default.</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
