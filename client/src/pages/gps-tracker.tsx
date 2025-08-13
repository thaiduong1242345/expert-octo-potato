import { useEffect, useState } from "react";
import { useGpsTracking } from "@/hooks/use-gps-tracking";
import LeafletMap from "@/components/map/leaflet-map";
import ErrorBanner from "@/components/ui/error-banner";
import StatusPanel from "@/components/ui/status-panel";
import LegendPanel from "@/components/ui/legend-panel";
import { MapPin } from "lucide-react";

export default function GpsTracker() {
  const { data, error, isLoading, lastUpdate } = useGpsTracking();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [error]);

  const connectionStatus = error ? 'error' : 'connected';

  return (
    <div className="bg-gray-50 font-sans overflow-hidden h-screen">
      {/* App Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900" data-testid="title-app">
                GPS Tracker
              </h1>
              <p className="text-xs text-gray-500">Real-time Vehicle Monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2" data-testid="connection-status">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">
                {connectionStatus === 'connected' ? 'Connected' : 'Connection Error'}
              </span>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">Device ID</p>
              <p className="text-sm font-semibold text-gray-900" data-testid="text-device-id">
                CAR01
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {showError && (
        <ErrorBanner 
          error={error?.message || 'Unknown error occurred'}
          onDismiss={() => setShowError(false)}
        />
      )}

      {/* Map Container */}
      <main className="h-screen pt-16">
        <LeafletMap 
          data={data} 
          isLoading={isLoading}
          error={error}
        />
      </main>

      {/* Status Panel */}
      <StatusPanel 
        data={data}
        lastUpdate={lastUpdate}
        connectionStatus={connectionStatus}
      />

      {/* Legend Panel */}
      <LegendPanel />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[1002] flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 font-medium">Loading tracking data...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
