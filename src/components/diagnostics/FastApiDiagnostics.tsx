
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
    <Card className="w-full max-w-6xl mx-auto">
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
            {loading ? 'Running Comprehensive Diagnostics...' : 'Test All FastAPI Endpoints'}
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

            {/* Primary Endpoint Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {results.directTest && getStatusIcon(results.directTest.success)}
                  Primary Diamond Endpoint Test
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
                          Data received: {Array.isArray(results.directTest.data) ? `${results.directTest.data.length} diamonds found` : 'Object response'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No direct test results available</p>
                )}
              </CardContent>
            </Card>

            {/* All Endpoints Test */}
            {results.allEndpoints && results.allEndpoints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Complete API Endpoint Analysis</CardTitle>
                  <p className="text-sm text-gray-600">Testing all known FastAPI endpoints</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {results.allEndpoints.map((test: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(test.success)}
                          <div>
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {test.endpoint}
                            </code>
                            <p className="text-xs text-gray-600 mt-1">{test.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(test.success, test.status)}
                          {test.error && (
                            <span className="text-xs text-red-600 max-w-xs truncate" title={test.error}>
                              {test.error}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <div className="text-sm">
                      <strong>Summary:</strong> {results.allEndpoints.filter((t: any) => t.success).length} of {results.allEndpoints.length} endpoints responding correctly
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alternative Diamond Endpoints */}
            {results.alternativeEndpoints && results.alternativeEndpoints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alternative Diamond Endpoints</CardTitle>
                  <p className="text-sm text-gray-600">Testing different paths for diamond inventory</p>
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
                  <CardTitle className="text-lg">🔧 Diagnostic Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.recommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                        <span className="text-sm text-blue-800">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Python Test Commands */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🐍 Direct API Test Commands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Test Primary Endpoint:</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                    <div className="text-gray-400 mb-2"># Test the main diamond inventory endpoint</div>
                    <div>import requests</div>
                    <div><br /></div>
                    <div>response = requests.get(</div>
                    <div className="ml-4">"https://api.mazalbot.com/api/v1/get_all_stones?user_id=2138564172",</div>
                    <div className="ml-4">headers={{"Authorization": "Bearer ifj9ov1rh20fslfp"}}</div>
                    <div>)</div>
                    <div><br /></div>
                    <div>print(f"Status: {{response.status_code}}")</div>
                    <div>print(f"Headers: {{dict(response.headers)}}")</div>
                    <div>print(f"Response: {{response.text[:1000]}}")</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Test API Health:</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                    <div className="text-gray-400 mb-2"># Test if FastAPI server is running</div>
                    <div>import requests</div>
                    <div><br /></div>
                    <div>response = requests.get("https://api.mazalbot.com/health")</div>
                    <div>print(f"Health Status: {{response.status_code}}")</div>
                    <div>print(f"Response: {{response.text}}")</div>
                  </div>
                </div>

                <Alert>
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>CRITICAL:</strong> Replace "ifj9ov1rh20fslfp" with a new secure token before testing!
                    </AlertDescription>
                  </Alert>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
