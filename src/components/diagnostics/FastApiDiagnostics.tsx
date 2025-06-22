
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { FastApiTester } from '@/utils/fastApiTester';

export function FastApiDiagnostics() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const diagnosticResults = await FastApiTester.runFullDiagnostic();
      setResults(diagnosticResults);
      console.log('🔍 Full diagnostic results:', diagnosticResults);
    } catch (error) {
      console.error('Diagnostic failed:', error);
      setResults({
        error: error instanceof Error ? error.message : 'Diagnostic failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (success: boolean, status?: number) => {
    if (success) {
      return <Badge className="bg-green-100 text-green-800">Success</Badge>;
    }
    
    if (status) {
      const variant = status >= 500 ? 'destructive' : status >= 400 ? 'secondary' : 'outline';
      return <Badge variant={variant}>HTTP {status}</Badge>;
    }
    
    return <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          FastAPI Connection Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Button 
            onClick={runDiagnostic} 
            disabled={loading}
            size="lg"
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {loading ? 'Running Diagnostics...' : 'Run FastAPI Diagnostic'}
          </Button>
        </div>

        {results && (
          <div className="space-y-6">
            {/* Security Alert */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>🔒 SECURITY ALERT:</strong> Backend token "ifj9ov1rh20fslfp" was exposed in logs. 
                Rotate this token immediately in your Supabase secrets.
              </AlertDescription>
            </Alert>

            {/* Direct Connection Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {results.directTest && getStatusIcon(results.directTest.success)}
                  Primary Endpoint Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.directTest ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Endpoint:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {results.directTest.endpoint}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status:</span>
                      {getStatusBadge(results.directTest.success, results.directTest.statusCode)}
                    </div>
                    {results.directTest.error && (
                      <Alert variant="destructive">
                        <AlertDescription>{results.directTest.error}</AlertDescription>
                      </Alert>
                    )}
                    {results.directTest.success && results.directTest.data && (
                      <div className="bg-green-50 p-3 rounded border">
                        <p className="text-green-800 font-medium">✅ Connection Successful!</p>
                        <p className="text-sm text-green-700">
                          Data received: {Array.isArray(results.directTest.data) ? `${results.directTest.data.length} items` : 'Object response'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No direct test results available</p>
                )}
              </CardContent>
            </Card>

            {/* Alternative Endpoints */}
            {results.alternativeEndpoints && results.alternativeEndpoints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alternative Endpoint Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.alternativeEndpoints.map((test: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.success)}
                          <code className="text-sm">{test.endpoint}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(test.success, test.status)}
                          {test.error && (
                            <span className="text-sm text-red-600">{test.error}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔧 Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.recommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        <span className="text-sm text-blue-800">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Raw Python Test Command */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🐍 Python Test Command</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                  <div className="mb-2 text-gray-400"># Correct Python test command:</div>
                  <div>import requests</div>
                  <div><br /></div>
                  <div>response = requests.get(</div>
                  <div className="ml-4">"https://api.mazalbot.com/api/v1/get_all_stones?user_id=2138564172",</div>
                  <div className="ml-4">headers={{"Authorization": "Bearer ifj9ov1rh20fslfp"}}</div>
                  <div>)</div>
                  <div><br /></div>
                  <div>print(f"Status: {{response.status_code}}")</div>
                  <div>print(f"Response: {{response.text[:500]}}")</div>
                </div>
                <Alert className="mt-3">
                  <AlertDescription>
                    <strong>Note:</strong> Make sure to replace the token with a new one after rotation.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
