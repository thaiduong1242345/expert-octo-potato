export default function LegendPanel() {
  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-[1000]">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Map Legend</h4>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
          <span className="text-xs text-gray-600">Start Point</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
          <span className="text-xs text-gray-600">End Point</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm animate-pulse"></div>
          <span className="text-xs text-gray-600">Live Position</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-blue-500 rounded"></div>
          <span className="text-xs text-gray-600">Route Path</span>
        </div>
      </div>
    </div>
  );
}
