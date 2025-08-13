import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchTrackingData, type GpsTrackingResponse } from "@/lib/gps-api";

export function useGpsTracking() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { data, error, isLoading, refetch } = useQuery<GpsTrackingResponse>({
    queryKey: ['/api/track'],
    queryFn: fetchTrackingData,
    refetchInterval: 2000, // Refetch every 2 seconds
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (data) {
      setLastUpdate(new Date());
    }
  }, [data]);

  return {
    data,
    error,
    isLoading,
    lastUpdate,
    refetch,
  };
}
