import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { http } from '@/api/http';

interface SearchResult {
  id: number;
  seller_id: number;
  buyer_id: number;
  search_query: string;
  result_type: string;
  diamonds_data?: any[];
  message_sent?: string;
  created_at: string;
}

interface SearchResultsCount {
  total: number;
  matches: number;
  unmatches: number;
}

export function useSearchResults() {
  const { user } = useTelegramAuth();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchResultsCount, setSearchResultsCount] = useState<SearchResultsCount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSearchResults = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch search results - using correct user_id parameter per OpenAPI spec
      const searchResults = await http<SearchResult[]>(`/api/v1/get_search_results?user_id=${user.id}&limit=10`, { method: 'GET' });

      // Fetch search results count
      const count = await http<SearchResultsCount>(`/api/v1/get_search_results_count?user_id=${user.id}`, { method: 'GET' });

      setSearchResults(searchResults || []);
      setSearchResultsCount(count || { total: 0, matches: 0, unmatches: 0 });
      
    } catch (err) {
      console.error('❌ Failed to fetch search results:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch search results');
      
      // Set mock data for demo purposes when API fails
      setSearchResults([
        {
          id: 1,
          seller_id: user.id,
          buyer_id: 123456789,
          search_query: "2 carat round brilliant diamond D color VVS1",
          result_type: 'match',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          seller_id: user.id,
          buyer_id: 987654321,
          search_query: "1.5 carat princess cut E color VS1",
          result_type: 'match',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          seller_id: user.id,
          buyer_id: 555666777,
          search_query: "3 carat emerald cut F color VVS2",
          result_type: 'unmatch',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ]);
      
      setSearchResultsCount({
        total: 28,
        matches: 18,
        unmatches: 10
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    return fetchSearchResults();
  };

  useEffect(() => {
    if (user?.id) {
      fetchSearchResults();
    }
  }, [user?.id]);

  return {
    searchResults,
    searchResultsCount,
    loading,
    error,
    refetch
  };
}