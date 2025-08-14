import { useState } from "react";
import { Settings, Check, X, Server, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ServerConfigPanelProps {
  onServerChange: (newServer: string) => void;
  onDelayChange: (newDelay: number) => void;
  currentServer: string;
  currentDelay: number;
  onRtmpServerChange?: (newServer: string) => void;
  currentRtmpServer?: string;
}

export default function ServerConfigPanel({ 
  onServerChange, 
  onDelayChange, 
  currentServer, 
  currentDelay,
  onRtmpServerChange,
  currentRtmpServer = "rtmp://localhost:1935/live"
}: ServerConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(currentServer);
  const [delayValue, setDelayValue] = useState(currentDelay?.toString() || '2000');
  const [rtmpInputValue, setRtmpInputValue] = useState(currentRtmpServer);

  const handleSave = () => {
    onServerChange(inputValue);
    onDelayChange(parseInt(delayValue) || 2000);
    if (onRtmpServerChange) {
      onRtmpServerChange(rtmpInputValue);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setInputValue(currentServer);
    setDelayValue(currentDelay?.toString() || '2000');
    setRtmpInputValue(currentRtmpServer);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-20 right-4 z-[1000]">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
          data-testid="button-open-server-config"
        >
          <Settings className="w-4 h-4 mr-2" />
          Server Config
        </Button>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-[320px] max-w-[400px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Server Configuration</h3>
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                data-testid="button-close-server-config"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <Carousel className="w-full">
              <CarouselContent>
                {/* GPS Server Config */}
                <CarouselItem>
                  <div className="p-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Server className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-medium text-gray-900">GPS Server</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-600 font-medium">FastAPI Server URL</label>
                        <Input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="http://3.7.100.109:55575"
                          className="text-sm"
                          data-testid="input-server-url"
                        />
                        <p className="text-xs text-gray-500">
                          Enter the base URL for the FastAPI GPS tracking service
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-600 font-medium">Request Interval (milliseconds)</label>
                        <Input
                          type="number"
                          value={delayValue}
                          onChange={(e) => setDelayValue(e.target.value)}
                          placeholder="2000"
                          min="500"
                          max="30000"
                          className="text-sm"
                          data-testid="input-request-delay"
                        />
                        <p className="text-xs text-gray-500">
                          Time between GPS data requests (500ms - 30s)
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* RTMP Server Config */}
                <CarouselItem>
                  <div className="p-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Video className="w-4 h-4 text-red-600" />
                      <h4 className="text-sm font-medium text-gray-900">RTMP Server</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-600 font-medium">RTMP Stream URL</label>
                        <Input
                          type="text"
                          value={rtmpInputValue}
                          onChange={(e) => setRtmpInputValue(e.target.value)}
                          placeholder="rtmp://localhost:1935/live"
                          className="text-sm"
                          data-testid="input-rtmp-url"
                        />
                        <p className="text-xs text-gray-500">
                          Enter the RTMP server URL for live video streaming
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                        <p className="text-xs text-amber-700">
                          Configure your RTMP server to stream live video from vehicle cameras
                        </p>
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

            <div className="flex items-center space-x-2 pt-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="flex-1"
                data-testid="button-save-server"
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex-1"
                data-testid="button-cancel-server"
              >
                Cancel
              </Button>
            </div>

            <div className="border-t border-gray-100 pt-2 space-y-1">
              <p className="text-xs text-gray-500">
                GPS: <span className="font-mono text-gray-700">{currentServer}</span>
              </p>
              <p className="text-xs text-gray-500">
                RTMP: <span className="font-mono text-gray-700">{currentRtmpServer}</span>
              </p>
              <p className="text-xs text-gray-500">
                Interval: <span className="font-mono text-gray-700">{currentDelay}ms</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}