import { useEffect, useState, useRef } from "react";
import type { GpsTrackingResponse } from "@/lib/gps-api";
import { calculateStats } from "@/lib/gps-api";
import { useAddressLookup } from "@/hooks/use-address-lookup";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Play, AlertCircle, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedStatusPanelProps {
  data: GpsTrackingResponse | null | undefined;
  lastUpdate: Date | null;
  connectionStatus: string;
  rtmpUrl?: string;
}

export default function EnhancedStatusPanel({ 
  data, 
  lastUpdate, 
  connectionStatus,
  rtmpUrl = "rtmp://localhost:1935/live"
}: EnhancedStatusPanelProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  const handleVideoLoad = async () => {
    setIsVideoLoading(true);
    setVideoError(null);
    
    try {
      // Check if RTMP server is accessible by testing the base URL
      const rtmpBaseUrl = rtmpUrl.replace('rtmp://', 'http://').split('/')[0] + ':8080';
      
      // Try to fetch stream info or playlist
      const response = await fetch(`${rtmpBaseUrl}/hls/stream.m3u8`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        // RTMP server is running and providing HLS
        setVideoError("RTMP server detected but video conversion not available. Configure media server with HLS output for web playback.");
      } else {
        throw new Error('RTMP server not accessible');
      }
    } catch (error) {
      // RTMP server is not running or not accessible
      setVideoError("RTMP server not responding. Please start your RTMP server and ensure it's configured for web streaming.");
    } finally {
      setIsVideoLoading(false);
    }
  };

  const convertRtmpToHls = (rtmpUrl: string): string => {
    // Convert RTMP URL to HLS for web playback
    // This is a simplified conversion - in production you'd need a media server
    return rtmpUrl.replace('rtmp://', 'http://').replace(':1935', ':8080') + '/playlist.m3u8';
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto bg-white rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 z-[1000] sm:min-w-[320px] sm:max-w-[400px]">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Status Monitor</h3>
          <span className="text-xs text-gray-500" data-testid="text-last-update">
            {lastUpdate ? `${secondsAgo}s ago` : 'No updates'}
          </span>
        </div>
        
        <Carousel className="w-full">
          <CarouselContent>
            {/* Tracking Status */}
            <CarouselItem>
              <div className="p-1">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-medium text-gray-900">GPS Tracking</h4>
                </div>
                
                {/* Speed Display */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-2 sm:p-3 border border-orange-100 mb-3">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1" data-testid="text-current-speed">
                      {stats.currentSpeed.split(' ')[0]}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-orange-700">km/h</div>
                    <div className="text-xs text-gray-600 mt-1">Current Speed</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
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
                
                <div className="border-t border-gray-100 pt-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">GPS Status</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        connectionStatus === 'connected' 
                          ? 'bg-green-500 animate-pulse' 
                          : connectionStatus === 'mock'
                          ? 'bg-yellow-500 animate-pulse'
                          : 'bg-red-500'
                      }`}></div>
                      <span className="text-gray-900 font-medium" data-testid="text-current-location">
                        {connectionStatus === 'connected' ? 'Live GPS' : 
                         connectionStatus === 'mock' ? 'GPS Down' : 'Error'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* RTMP Video Status */}
            <CarouselItem>
              <div className="p-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Video className="w-4 h-4 text-red-600" />
                  <h4 className="text-sm font-medium text-gray-900">Live Video</h4>
                </div>
                
                <div className="bg-black rounded-lg aspect-video relative overflow-hidden mb-3">
                  {!videoError && !isVideoLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Button
                          onClick={handleVideoLoad}
                          variant="outline"
                          size="sm"
                          className="bg-white/90 hover:bg-white mb-2"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Test RTMP Server
                        </Button>
                        <p className="text-xs text-white/70">
                          Check server status and connectivity
                        </p>
                      </div>
                    </div>
                  ) : isVideoLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-xs">Testing RTMP connection...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                      <AlertCircle className="w-6 h-6 mb-2 text-red-400" />
                      <p className="text-xs text-white text-center mb-3 leading-relaxed">
                        {videoError}
                      </p>
                      <Button
                        onClick={handleVideoLoad}
                        variant="outline"
                        size="sm"
                        className="bg-white/90 hover:bg-white text-black"
                      >
                        Test Again
                      </Button>
                    </div>
                  )}
                  
                  {/* Info overlay for RTMP limitations */}
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/60 rounded px-2 py-1">
                      <p className="text-xs text-white/80">RTMP</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Stream URL</span>
                    <div className={`w-2 h-2 rounded-full ${
                      videoError ? 'bg-red-500' : isVideoLoading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <p className="text-xs font-mono text-gray-600 bg-gray-50 p-1 rounded text-center">
                    {rtmpUrl}
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <h5 className="text-xs font-medium text-blue-800 mb-1">RTMP Web Playback</h5>
                    <p className="text-xs text-blue-700 mb-1">
                      RTMP streams require conversion for web browsers:
                    </p>
                    <ul className="text-xs text-blue-600 space-y-0.5">
                      <li>• Configure media server (nginx-rtmp, SRS, etc.)</li>
                      <li>• Enable HLS/DASH output</li>
                      <li>• Or use WebRTC for low latency</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          
          <div className="flex justify-center space-x-2 mt-2">
            <CarouselPrevious className="relative translate-x-0 translate-y-0 static" />
            <CarouselNext className="relative translate-x-0 translate-y-0 static" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}