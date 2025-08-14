import { useEffect, useState, useRef } from "react";
import type { GpsTrackingResponse } from "@/lib/gps-api";
import { calculateStats } from "@/lib/gps-api";
import { useAddressLookup } from "@/hooks/use-address-lookup";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Play, AlertCircle, MapPin, Video, RefreshCw } from "lucide-react";
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
  const [playerInitialized, setPlayerInitialized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
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
    if (playerInitialized && playerRef.current) {
      // If player already exists, dispose it first
      playerRef.current.dispose();
      setPlayerInitialized(false);
      playerRef.current = null;
    }

    setIsVideoLoading(true);
    setVideoError(null);
    
    if (videoRef.current) {
      try {
        // Load Video.js dynamically
        const { default: videojs } = await import('video.js');
        
        // Convert RTMP to HLS URL for web playback
        const hlsUrl = convertRtmpToHls(rtmpUrl);
        
        // Initialize Video.js player
        const player = videojs(videoRef.current, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          width: '100%',
          height: '100%',
          sources: [{
            src: hlsUrl,
            type: 'application/x-mpegURL'
          }],
          html5: {
            hls: {
              enableLowInitialPlaylist: true,
              smoothQualityChange: true,
              overrideNative: true
            }
          }
        });

        playerRef.current = player;
        setPlayerInitialized(true);

        // Handle player ready
        player.ready(() => {
          setIsVideoLoading(false);
          player.play().catch(() => {
            setVideoError("Stream not available. Check RTMP server configuration.");
          });
        });

        // Handle errors
        player.on('error', () => {
          setVideoError("Failed to load video stream. Verify RTMP server is running and accessible.");
          setIsVideoLoading(false);
        });

      } catch (error) {
        setVideoError("Failed to initialize video player. Check stream configuration.");
        setIsVideoLoading(false);
      }
    }
  };

  const convertRtmpToHls = (rtmpUrl: string): string => {
    // Convert RTMP URL to HLS for web playback
    // Extract server and stream key from RTMP URL
    const urlParts = rtmpUrl.replace('rtmp://', '').split('/');
    const server = urlParts[0];
    const streamKey = urlParts.slice(1).join('/') || 'stream';
    
    // Return HLS URL - assumes media server converts RTMP to HLS
    return `http://${server.replace(':1935', ':8080')}/hls/${streamKey}.m3u8`;
  };

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

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
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <Button
                        onClick={handleVideoLoad}
                        variant="outline"
                        size="sm"
                        className="bg-white/90 hover:bg-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Load Stream
                      </Button>
                    </div>
                  ) : isVideoLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="text-white text-center">
                        <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" />
                        <p className="text-xs">Loading stream...</p>
                      </div>
                    </div>
                  ) : videoError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 z-10">
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
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  ) : null}
                  
                  {/* Video.js player element */}
                  <video
                    ref={videoRef}
                    className="video-js vjs-default-skin w-full h-full"
                    controls
                    preload="auto"
                    data-setup="{}"
                  />
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