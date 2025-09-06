import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSearchResults } from '@/hooks/useSearchResults';
import { Loader2, Search, Diamond, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function SearchResultsTestPage() {
  const [userId, setUserId] = useState<number>(609472329); // Default test user ID
  const [resultType, setResultType] = useState<'match' | 'unmatch' | 'all'>('match');
  const [testUserId, setTestUserId] = useState<string>('609472329');

  const { results, loading, error, pagination, loadMore, refresh } = useSearchResults(userId, resultType);

  const handleTest = () => {
    const newUserId = parseInt(testUserId);
    if (isNaN(newUserId) || newUserId <= 0) {
      toast.error('Please enter a valid user ID');
      return;
    }
    setUserId(newUserId);
    toast.info(`Testing search results for user ${newUserId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Search Results API Test</h1>
          <p className="text-muted-foreground">
            Test the new /api/v1/get_search_results endpoint
          </p>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">User ID</label>
                <Input
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  placeholder="Enter user ID"
                  type="number"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Result Type</label>
                <Select value={resultType} onValueChange={(value: any) => setResultType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Matches Only</SelectItem>
                    <SelectItem value="unmatch">Unmatches Only</SelectItem>
                    <SelectItem value="all">All Results</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex gap-2">
                  <Button onClick={handleTest} disabled={loading}>
                    Test API
                  </Button>
                  <Button variant="outline" onClick={refresh} disabled={loading}>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Diamond className="h-5 w-5" />
              Results Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading search results...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-destructive font-medium">Error: {error}</p>
                <Button variant="outline" onClick={refresh} className="mt-2">
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{results.length}</div>
                  <div className="text-sm text-muted-foreground">Current Results</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{pagination.total}</div>
                  <div className="text-sm text-muted-foreground">Total Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userId}</div>
                  <div className="text-sm text-muted-foreground">Current User ID</div>
                </div>
                <div className="text-center">
                  <Badge variant={pagination.has_more ? "default" : "secondary"}>
                    {pagination.has_more ? "Has More" : "All Loaded"}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">Pagination</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {!loading && !error && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Search Results ({results.length})</h2>
            
            <div className="grid gap-4">
              {results.map((result) => (
                <Card key={result.id} className="w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Diamond className="h-4 w-4" />
                        Diamond {result.diamond_id}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={result.is_match ? "default" : "destructive"}>
                          {result.match_type}
                        </Badge>
                        <Badge variant="outline">
                          {result.user_role}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Buyer: {result.buyer_id}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Seller: {result.seller_id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(result.created_at)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Match Details</h4>
                        <div className="space-y-1 text-sm">
                          <div>Confidence: {Math.round((result.confidence_score || 0) * 100)}%</div>
                          <div>Match ID: {result.id}</div>
                        </div>
                      </div>
                      
                      {result.diamond_details && (
                        <div>
                          <h4 className="font-medium mb-2">Diamond Details</h4>
                          <div className="space-y-1 text-sm">
                            <div>Shape: {result.diamond_details.shape}</div>
                            <div>Weight: {result.diamond_details.weight} ct</div>
                            <div>Color: {result.diamond_details.color}</div>
                            <div>Clarity: {result.diamond_details.clarity}</div>
                            {result.diamond_details.price_per_carat && (
                              <div>Price: ${result.diamond_details.price_per_carat}/ct</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {result.details_json && Object.keys(result.details_json).length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Additional Details</h4>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(result.details_json, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {pagination.has_more && (
              <div className="text-center">
                <Button onClick={loadMore} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More Results'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Diamond className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Search Results Found</h3>
              <p className="text-muted-foreground mb-4">
                No {resultType} results found for user {userId}. This could mean:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• The user hasn't had any search matches yet</li>
                <li>• The database tables are empty (new system)</li>
                <li>• The user ID doesn't exist in the system</li>
              </ul>
              <Button variant="outline" onClick={refresh}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}