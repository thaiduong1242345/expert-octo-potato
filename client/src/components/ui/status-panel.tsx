import { useEffect, useState } from "react";
import type { GpsTrackingResponse } from "@/lib/gps-api";
import { calculateStats } from "@/lib/gps-api";

interface StatusPanelProps {
  data: GpsTrackingResponse | null | undefined;
  lastUpdate: Date | null;
  connectionStatus: string;
}

export default function StatusPanel({ data, lastUpdate, connectionStatus }: StatusPanelProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const stats = calculateStats(data);

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
    <div className="fixed bottom-6 left-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-[1000] min-w-[280px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Tracking Status</h3>
          <span className="text-xs text-gray-500" data-testid="text-last-update">
            {lastUpdate ? `${secondsAgo} seconds ago` : 'No updates'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600" data-testid="text-total-points">
              {stats.totalPoints}
            </div>
            <div className="text-xs text-gray-500">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600" data-testid="text-distance">
              {stats.distanceTraveled}
            </div>
            <div className="text-xs text-gray-500">Distance</div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between text-sm">
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
          
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Lat:</span>
              <span className="font-mono text-gray-900" data-testid="text-latitude">
                {stats.currentLocation ? stats.currentLocation[0].toFixed(6) : '--'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Lng:</span>
              <span className="font-mono text-gray-900" data-testid="text-longitude">
                {stats.currentLocation ? stats.currentLocation[1].toFixed(6) : '--'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Updated:</span>
              <span className="text-gray-900" data-testid="text-timestamp">
                {stats.lastTimestamp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
