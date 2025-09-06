import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  buyer_id: number;
  seller_id: number;
  diamond_id: string;
  is_match: boolean;
  confidence_score: number;
  details_json: any;
  created_at: string;
  updated_at: string;
  diamond_details: any;
  match_type: 'match' | 'unmatch';
  user_role: 'buyer' | 'seller';
}

interface SearchResultsResponse {
  results: SearchResult[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
  metadata: {
    user_id: string;
    result_type: string;
    timestamp: string;
  };
}

export function useSearchResults(userId: number, resultType: 'match' | 'unmatch' | 'all' = 'match') {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
    has_more: false
  });

  const fetchSearchResults = async (limit = 50, offset = 0) => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching search results:', { userId, resultType, limit, offset });

      const { data, error: functionError } = await supabase.functions.invoke('get-search-results', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (functionError) {
        console.error('❌ Search results error:', functionError);
        throw new Error(functionError.message || 'Failed to fetch search results');
      }

      const response = data as SearchResultsResponse;
      
      setResults(response.results || []);
      setPagination(response.pagination || {
        limit,
        offset,
        total: 0,
        has_more: false
      });

      console.log('✅ Search results fetched:', {
        count: response.results?.length || 0,
        total: response.pagination?.total || 0
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch search results';
      setError(errorMessage);
      toast.error(`Failed to load search results: ${errorMessage}`);
      console.error('❌ useSearchResults error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (pagination.has_more && !loading) {
      fetchSearchResults(pagination.limit, pagination.offset + pagination.limit);
    }
  };

  const refresh = () => {
    fetchSearchResults(pagination.limit, 0);
  };

  useEffect(() => {
    if (userId) {
      fetchSearchResults();
    }
  }, [userId, resultType]);

  return {
    results,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
    fetchSearchResults
  };
}