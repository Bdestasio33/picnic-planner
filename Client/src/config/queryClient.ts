import { QueryClient } from "@tanstack/react-query";

// Create a QueryClient with optimized caching configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 10 minutes before considering it stale
      staleTime: 10 * 60 * 1000, 
      // Keep data in cache for 15 minutes after component unmounts
      gcTime: 15 * 60 * 1000, 
      // Retry failed requests up to 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for better performance
      refetchOnWindowFocus: false,
      // Don't refetch on mount if data is still fresh
      refetchOnMount: true,
      // Don't refetch on reconnect if data is still fresh
      refetchOnReconnect: "always",
      // Only refetch if data is stale when network reconnects
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Keep mutation cache for 5 minutes
      gcTime: 5 * 60 * 1000,
    },
  },
});

export default queryClient; 