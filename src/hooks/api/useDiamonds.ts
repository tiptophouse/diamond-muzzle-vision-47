/**
 * React Query hooks for diamond management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { DiamondCreateRequest, DiamondUpdateRequest } from '@/types/fastapi-models';
import * as diamondsApi from '@/api/diamonds';
import { apiEndpoints } from '@/lib/api/endpoints';
import { http } from '@/api/http';
import { transformToFastAPICreate, transformToFastAPIUpdate } from '@/api/diamondTransformers';
import { API_BASE_URL } from '@/lib/api/config';
import { getBackendAuthToken } from '@/lib/api/auth';

// Query keys
export const diamondKeys = {
  all: ['diamonds'] as const,
  lists: () => [...diamondKeys.all, 'list'] as const,
  list: (userId: number) => [...diamondKeys.lists(), userId] as const,
  details: () => [...diamondKeys.all, 'detail'] as const,
  detail: (id: string) => [...diamondKeys.details(), id] as const,
};

/**
 * Get all stones for the authenticated user
 */
export function useGetAllStones(userId: number) {
  return useQuery({
    queryKey: diamondKeys.list(userId),
    queryFn: async () => {
      const endpoint = apiEndpoints.getAllStones();
      return http<any[]>(endpoint, { method: 'GET' });
    },
    enabled: !!userId,
  });
}

/**
 * Create a single diamond with optimistic updates and haptic feedback
 */
export function useCreateDiamond() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ data, userId }: { data: any; userId: number }) => {
      // Check JWT token before making request
      const token = getBackendAuthToken();
      console.log('🔐 CREATE: JWT Status:', {
        exists: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'MISSING',
        stockNumber: data.stockNumber || data.stock_number,
        userId
      });

      if (!token) {
        throw new Error('JWT token missing - authentication required for creating diamonds');
      }

      console.log('💎 Creating diamond:', data.stockNumber || data.stock_number);
      const transformedData = transformToFastAPICreate(data);
      return diamondsApi.createDiamond(transformedData);
    },
    onMutate: async ({ data, userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: diamondKeys.list(userId) });

      // Snapshot previous value
      const previousDiamonds = queryClient.getQueryData(diamondKeys.list(userId));

      // Optimistically update
      queryClient.setQueryData(diamondKeys.list(userId), (old: any[] = []) => {
        const newDiamond = {
          id: `temp-${Date.now()}`,
          ...data,
          created_at: new Date().toISOString(),
        };
        return [newDiamond, ...old];
      });

      return { previousDiamonds };
    },
    onSuccess: (data, variables) => {
      console.log('✅ Diamond created successfully:', data);
      
      // Haptic success feedback
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      
      toast({
        title: '✅ יהלום נוסף בהצלחה',
        description: 'היהלום נוסף למלאי שלך',
      });
    },
    onError: (error: Error, variables, context) => {
      console.error('❌ Diamond creation failed:', error);
      
      // Haptic error feedback
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('error');
      } catch (e) {}
      
      // Rollback optimistic update
      if (context?.previousDiamonds) {
        queryClient.setQueryData(diamondKeys.list(variables.userId), context.previousDiamonds);
      }
      
      // Show detailed error information including request details
      const transformedData = transformToFastAPICreate(variables.data);
      const requestUrl = `${API_BASE_URL}${apiEndpoints.addDiamond()}`;
      
      // Custom serializer to handle nested objects and circular references
      const safeStringify = (obj: any, indent = 2): string => {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        }, indent);
      };

      // Extract detailed error information
      let errorMessage = 'Unknown error';
      let statusCode = 'N/A';
      let responseData = 'N/A';
      
      if (error instanceof Error) {
        // Try to serialize the entire error object first
        try {
          const errorObj = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...error
          };
          errorMessage = safeStringify(errorObj);
        } catch (e) {
          errorMessage = error.message;
        }
        
        // Check if it's an HTTP error with response data
        const httpError = error as any;
        if (httpError.status) {
          statusCode = httpError.status;
        }
        if (httpError.response) {
          try {
            responseData = safeStringify(httpError.response);
          } catch (e) {
            responseData = String(httpError.response);
          }
        }
        if (httpError.data) {
          try {
            responseData = safeStringify(httpError.data);
          } catch (e) {
            responseData = String(httpError.data);
          }
        }
      } else if (typeof error === 'object' && error !== null) {
        try {
          errorMessage = safeStringify(error);
        } catch (e) {
          errorMessage = String(error);
        }
      } else {
        errorMessage = String(error);
      }
      
      const errorDetails = `
URL: ${requestUrl}
Status: ${statusCode}

Error Message: ${errorMessage}

Response Data: ${responseData}

Request Body: 
${JSON.stringify(transformedData, null, 2)}
      `.trim();
      
      toast({
        title: '❌ שגיאה בהוספת יהלום',
        description: errorDetails,
        variant: 'destructive',
        duration: 10000,
      });
      
      // Also alert for visibility
      alert(`❌ CREATE DIAMOND FAILED\n\n${errorDetails}`);
    },
  });
}

/**
 * Update a diamond with optimistic updates and haptic feedback
 */
export function useUpdateDiamond() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      diamondId,
      data,
      userId,
    }: {
      diamondId: number;
      data: any;
      userId: number;
    }) => {
      // Check JWT token before making request
      const token = getBackendAuthToken();
      console.log('🔐 UPDATE: JWT Status:', {
        exists: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'MISSING',
        diamondId,
        stockNumber: data.stockNumber || data.stock_number,
        userId
      });

      if (!token) {
        throw new Error('JWT token missing - authentication required for updating diamonds');
      }

      console.log('✏️ Updating diamond:', diamondId);
      const transformedData = transformToFastAPIUpdate(data);
      return diamondsApi.updateDiamond(diamondId, transformedData);
    },
    onMutate: async ({ diamondId, data, userId }) => {
      await queryClient.cancelQueries({ queryKey: diamondKeys.list(userId) });
      
      const previousDiamonds = queryClient.getQueryData(diamondKeys.list(userId));
      
      // Optimistic update
      queryClient.setQueryData(diamondKeys.list(userId), (old: any[] = []) =>
        old.map(diamond => 
          diamond.id === diamondId || diamond.stock_number === diamondId
            ? { ...diamond, ...data, updated_at: new Date().toISOString() }
            : diamond
        )
      );
      
      return { previousDiamonds };
    },
    onSuccess: (data, variables) => {
      console.log('✅ Diamond updated successfully');
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      queryClient.invalidateQueries({ queryKey: diamondKeys.detail(variables.diamondId.toString()) });
      
      toast({
        title: '✅ יהלום עודכן בהצלחה',
        description: 'הפרטים של היהלום עודכנו',
      });
    },
    onError: (error: Error, variables, context) => {
      console.error('❌ Diamond update failed:', error);
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('error');
      } catch (e) {}
      
      if (context?.previousDiamonds) {
        queryClient.setQueryData(diamondKeys.list(variables.userId), context.previousDiamonds);
      }
      
      // Extract comprehensive error information
      const transformedData = transformToFastAPIUpdate(variables.data);
      const requestUrl = `${API_BASE_URL}${apiEndpoints.updateDiamond(variables.diamondId)}`;
      const token = getBackendAuthToken();
      
      // Safe stringify helper
      const safeStringify = (obj: any, indent = 2): string => {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) return '[Circular]';
            seen.add(value);
          }
          return value;
        }, indent);
      };
      
      // Extract detailed error information
      let errorMessage = 'Unknown error';
      let statusCode: string | number = 'N/A';
      let serverResponse = 'N/A';
      let errorCode = 'N/A';
      let errorHint = '';
      let errorDetails = '';
      let errorStack = '';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorStack = error.stack || 'No stack trace';
        
        // Check if it's an HTTP error with response data
        const httpError = error as any;
        
        if (httpError.status) {
          statusCode = httpError.status;
        }
        
        if (httpError.code) {
          errorCode = httpError.code;
        }
        
        if (httpError.response) {
          try {
            serverResponse = safeStringify(httpError.response);
          } catch (e) {
            serverResponse = String(httpError.response);
          }
        }
        
        if (httpError.data) {
          try {
            serverResponse = safeStringify(httpError.data);
            
            // Extract FastAPI validation errors
            if (httpError.data.detail) {
              if (Array.isArray(httpError.data.detail)) {
                errorDetails = httpError.data.detail.map((d: any) => 
                  `- ${d.loc?.join('.')} : ${d.msg}`
                ).join('\n');
              } else {
                errorDetails = String(httpError.data.detail);
              }
            }
          } catch (e) {
            serverResponse = String(httpError.data);
          }
        }
      } else {
        try {
          errorMessage = safeStringify(error);
        } catch (e) {
          errorMessage = String(error);
        }
      }
      
      // Add hints based on status code (outside if block)
      const statusNum = typeof statusCode === 'number' ? statusCode : parseInt(String(statusCode), 10);
      
      if (statusNum === 401) {
        errorHint = '🔐 Authentication failed - JWT token may be invalid or expired';
      } else if (statusNum === 403) {
        errorHint = '🚫 Permission denied - user may not have access to this diamond';
      } else if (statusNum === 404) {
        errorHint = '🔍 Diamond not found - ID may be incorrect or diamond was deleted';
      } else if (statusNum === 422) {
        errorHint = '⚠️ Validation error - check request body format and field types';
      } else if (statusNum === 500) {
        errorHint = '💥 Server error - backend may have crashed or database issue';
      }
      
      // Build comprehensive debug info
      const debugInfo = `
═══════════════════════════════════════
❌ DIAMOND UPDATE FAILED - DEBUG INFO
═══════════════════════════════════════

📍 REQUEST INFO:
   URL: ${requestUrl}
   Method: PUT
   Diamond ID: ${variables.diamondId}
   Stock Number: ${variables.data.stockNumber || variables.data.stock_number || 'N/A'}
   User ID: ${variables.userId}

🔐 AUTHENTICATION:
   JWT Token Present: ${token ? '✅ YES' : '❌ NO'}
   Token Preview: ${token ? token.substring(0, 30) + '...' : 'MISSING'}
   Token Length: ${token ? token.length : 0} chars

📤 REQUEST BODY (Transformed to FastAPI format):
${JSON.stringify(transformedData, null, 2)}

📥 SERVER RESPONSE:
   Status Code: ${statusCode}
   Error Code: ${errorCode}
   Response Body: 
${serverResponse}

❌ ERROR DETAILS:
   Message: ${errorMessage}
   ${errorHint ? `Hint: ${errorHint}` : ''}
   ${errorDetails ? `Validation Errors:\n${errorDetails}` : ''}

📋 ORIGINAL DATA (Before transformation):
${JSON.stringify(variables.data, null, 2)}

🔍 ERROR STACK TRACE:
${errorStack}

💡 TROUBLESHOOTING TIPS:
${statusNum === 401 ? 
  '- Close and reopen the app from Telegram to refresh JWT\n- Check if user is still authenticated' : ''}
${statusNum === 422 ? 
  '- Verify all required fields are present\n- Check field types match backend schema\n- Ensure enums match exact values (case-sensitive)' : ''}
${statusNum === 404 ? 
  '- Verify diamond ID is correct\n- Check if diamond still exists in database' : ''}
═══════════════════════════════════════
      `.trim();
      
      // Log full debug info to console
      console.error('═══ FULL UPDATE ERROR DEBUG ═══');
      console.error(debugInfo);
      console.error('═══ END DEBUG ═══');
      
      // Show shorter toast
      toast({
        title: '❌ שגיאה בעדכון יהלום',
        description: `Status: ${statusCode} | ${errorMessage.substring(0, 100)}`,
        variant: 'destructive',
        duration: 10000,
      });
      
      // Show full debug info in alert
      alert(debugInfo);
    },
  });
}

/**
 * Delete a diamond with optimistic updates and haptic feedback
 */
export function useDeleteDiamond() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ diamondId, userId }: { diamondId: number; userId: number }) => {
      console.log('🗑️ Deleting diamond ID:', diamondId);
      return diamondsApi.deleteDiamond(diamondId);
    },
    onMutate: async ({ diamondId, userId }) => {
      await queryClient.cancelQueries({ queryKey: diamondKeys.list(userId) });
      
      const previousDiamonds = queryClient.getQueryData(diamondKeys.list(userId));
      
      // Optimistic delete - match by numeric ID
      queryClient.setQueryData(diamondKeys.list(userId), (old: any[] = []) =>
        old.filter(diamond => {
          const id = diamond.id || diamond.diamond_id;
          return id !== diamondId;
        })
      );
      
      return { previousDiamonds };
    },
    onSuccess: (data, variables) => {
      console.log('✅ Diamond deleted successfully');
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      
      toast({
        title: '✅ יהלום נמחק בהצלחה',
        description: data.message || 'היהלום הוסר מהמלאי',
      });
    },
    onError: (error: Error, variables, context) => {
      console.error('❌ Diamond deletion failed:', error);
      
      try {
        const tg = window.Telegram?.WebApp as any;
        tg?.HapticFeedback?.notificationOccurred('error');
      } catch (e) {}
      
      if (context?.previousDiamonds) {
        queryClient.setQueryData(diamondKeys.list(variables.userId), context.previousDiamonds);
      }
      
      toast({
        title: '❌ שגיאה במחיקת יהלום',
        description: error.message || 'אנא נסה שוב',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Create multiple diamonds in batch
 */
export function useCreateDiamondsBatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ diamonds, userId }: { diamonds: any[]; userId: number }) =>
      diamondsApi.createDiamondsBatch(diamonds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: diamondKeys.list(variables.userId) });
      
      toast({
        title: 'יהלומים נוספו בהצלחה',
        description: `${variables.diamonds.length} יהלומים נוספו למלאי`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בהוספת יהלומים',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
