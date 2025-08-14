import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchTrackingData, type GpsApiResponse, type GpsTrackingResponse } from "@/lib/gps-api";

export function useGpsTracking(fastApiBase?: string, delay: number = 2000) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const { data: apiResponse, error, isLoading, refetch } = useQuery<GpsApiResponse>({
    queryKey: ['/api/track', fastApiBase, delay],
    queryFn: () => fetchTrackingData(fastApiBase),
    refetchInterval: delay, // Use configurable delay
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (apiResponse) {
      setLastUpdate(new Date());
      setIsUsingMockData(apiResponse.isUsingMockData);
    }
  }, [apiResponse]);

  return {
    data: apiResponse?.data,
    error,
    isLoading,
    lastUpdate,
    isUsingMockData,
    refetch,
  };
}
