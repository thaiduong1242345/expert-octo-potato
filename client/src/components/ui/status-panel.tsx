import { useEffect, useState } from "react";
import type { GpsTrackingResponse } from "@/lib/gps-api";
import { calculateStats } from "@/lib/gps-api";
import { useAddressLookup } from "@/hooks/use-address-lookup";

interface StatusPanelProps {
  data: GpsTrackingResponse | null | undefined;
  lastUpdate: Date | null;
  connectionStatus: string;
}

export default function StatusPanel({ data, lastUpdate, connectionStatus }: StatusPanelProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const stats = calculateStats(data || null);
  const { address, isLoading: addressLoading } = useAddressLookup(stats.currentLocation);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdate) {
        const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
        setSecondsAgo(seconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto bg-white rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 z-[1000] sm:min-w-[280px] sm:max-w-[320px]">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Tracking Status</h3>
          <span className="text-xs text-gray-500" data-testid="text-last-update">
            {lastUpdate ? `${secondsAgo}s ago` : 'No updates'}
          </span>
        </div>
        
        {/* Speed Display */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-2 sm:p-3 border border-orange-100">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1" data-testid="text-current-speed">
              {stats.currentSpeed.split(' ')[0]}
            </div>
            <div className="text-xs sm:text-sm font-medium text-orange-700">km/h</div>
            <div className="text-xs text-gray-600 mt-1">Current Speed</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-blue-600" data-testid="text-total-points">
              {stats.totalPoints}
            </div>
            <div className="text-xs text-gray-500">Points</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-green-600" data-testid="text-distance">
              {stats.distanceTraveled}
            </div>
            <div className="text-xs text-gray-500">Distance</div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-2 sm:pt-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Last Position</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-900 font-medium" data-testid="text-current-location">
                {stats.currentLocation ? 'Live' : 'No Data'}
              </span>
            </div>
          </div>
          
          <div className="mt-2 space-y-1 sm:space-y-2">
            <div className="text-xs text-gray-500">Current Address:</div>
            <div className="text-xs text-gray-900 break-words leading-relaxed" data-testid="text-current-address">
              {addressLoading ? (
                <div className="flex items-center space-x-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  <span>Loading address...</span>
                </div>
              ) : (
                address
              )}
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Lat:</span>
              <span className="font-mono text-gray-900 text-xs" data-testid="text-latitude">
                {stats.currentLocation ? stats.currentLocation[0].toFixed(4) : '--'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Lng:</span>
              <span className="font-mono text-gray-900 text-xs" data-testid="text-longitude">
                {stats.currentLocation ? stats.currentLocation[1].toFixed(4) : '--'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Updated:</span>
              <span className="text-gray-900 text-xs" data-testid="text-timestamp">
                {stats.lastTimestamp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
