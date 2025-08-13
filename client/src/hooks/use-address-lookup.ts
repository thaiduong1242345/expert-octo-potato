import { useState, useEffect } from "react";
import { fetchAddress } from "@/lib/gps-api";

export function useAddressLookup(location: [number, number] | null) {
  const [address, setAddress] = useState<string>('Loading address...');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!location) {
      setAddress('No location data');
      return;
    }

    const [lat, lon] = location;
    if (lat === 0 && lon === 0) {
      setAddress('Invalid coordinates');
      return;
    }

    setIsLoading(true);
    
    // Add a small delay to prevent too many requests
    const timeoutId = setTimeout(() => {
      fetchAddress(lat, lon)
        .then(addr => {
          setAddress(addr);
        })
        .catch(error => {
          console.error('Address lookup failed:', error);
          setAddress('Address lookup failed');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [location?.[0], location?.[1]]);

  return {
    address,
    isLoading
  };
}