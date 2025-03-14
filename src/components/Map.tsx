
import { useRef, useEffect, useState } from "react";
import { Search, Navigation, AlertTriangle, Shield, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// This is a simulated map - in a real implementation, we would integrate with a map provider like Mapbox or Google Maps
const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [safetyLevel, setSafetyLevel] = useState<'safe' | 'caution' | 'danger' | null>(null);
  
  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Areas with different safety ratings (simulated data)
  const safetyMarkers = [
    { id: 1, lat: 30, lng: 20, level: 'safe', label: 'Central Park Area' },
    { id: 2, lat: 35, lng: 15, level: 'caution', label: 'Downtown District' },
    { id: 3, lat: 40, lng: 25, level: 'danger', label: 'Industrial Zone' },
    { id: 4, lat: 32, lng: 22, level: 'safe', label: 'University Campus' },
    { id: 5, lat: 38, lng: 18, level: 'caution', label: 'Main Street' },
  ];
  
  // Mock function to handle area click
  const handleAreaClick = (level: 'safe' | 'caution' | 'danger') => {
    setSafetyLevel(level);
  };
  
  return (
    <div className="relative h-full w-full">
      {/* Search overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="glass-panel flex items-center p-3 rounded-xl">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search location..."
            className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="ml-2 text-primary"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Map container */}
      <div 
        ref={mapRef} 
        className={cn(
          "map-container bg-blue-50 transition-opacity duration-700",
          isMapLoaded ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Simulated map - would be replaced with an actual map implementation */}
        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/0,0,1,0/1200x800?access_token=pk.mock')] bg-center bg-no-repeat bg-cover">
          {/* Map overlay for visual effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5"></div>
        </div>
        
        {/* Simulated markers */}
        {isMapLoaded && safetyMarkers.map((marker) => (
          <button
            key={marker.id}
            className={cn(
              "absolute z-10 transform -translate-x-1/2 -translate-y-1/2 animate-fade-in group",
              marker.level === 'safe' ? "text-safety-safe" : 
              marker.level === 'caution' ? "text-safety-caution" : 
              "text-safety-danger"
            )}
            style={{ 
              left: `${marker.lat}%`, 
              top: `${marker.lng}%`,
              animationDelay: `${marker.id * 100}ms`
            }}
            onClick={() => handleAreaClick(marker.level as 'safe' | 'caution' | 'danger')}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              marker.level === 'safe' ? "bg-safety-safe/20" : 
              marker.level === 'caution' ? "bg-safety-caution/20" : 
              "bg-safety-danger/20",
              "transition-transform duration-300 group-hover:scale-110"
            )}>
              {marker.level === 'safe' ? (
                <Shield className="w-5 h-5" />
              ) : marker.level === 'caution' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className={cn(
                "whitespace-nowrap text-xs font-medium py-1 px-2 rounded-md shadow-elevation-low",
                marker.level === 'safe' ? "bg-safety-safe text-white" : 
                marker.level === 'caution' ? "bg-safety-caution text-white" : 
                "bg-safety-danger text-white"
              )}>
                {marker.label}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Current location button */}
      <button 
        className="action-button absolute bottom-28 right-4 bg-white text-primary"
        aria-label="Current location"
      >
        <Navigation className="w-5 h-5" />
      </button>
      
      {/* Report incident button */}
      <button 
        className="action-button absolute bottom-28 left-4 bg-destructive text-destructive-foreground"
        aria-label="Report incident"
      >
        <AlertTriangle className="w-5 h-5" />
      </button>
      
      {/* Safety information panel */}
      {safetyLevel && (
        <div className="absolute bottom-20 left-4 right-4 glass-panel p-4 rounded-xl animate-fade-in-up">
          <div className="flex items-start">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0",
              safetyLevel === 'safe' ? "bg-safety-safe text-white" : 
              safetyLevel === 'caution' ? "bg-safety-caution text-white" : 
              "bg-safety-danger text-white"
            )}>
              {safetyLevel === 'safe' ? (
                <Shield className="w-5 h-5" />
              ) : safetyLevel === 'caution' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {safetyLevel === 'safe' ? 'Safe Area' : 
                   safetyLevel === 'caution' ? 'Exercise Caution' : 
                   'Potential Danger'}
                </h3>
                <button 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setSafetyLevel(null)}
                >
                  Close
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {safetyLevel === 'safe' ? 
                  'This area has been rated as safe by community members with low incident reports.' : 
                safetyLevel === 'caution' ? 
                  'Proceed with caution. Some incidents have been reported in this area.' : 
                  'Multiple incidents reported. Consider alternative routes if possible.'}
              </p>
              {safetyLevel !== 'safe' && (
                <div className="mt-3 flex items-center justify-between">
                  <button className="text-sm text-primary font-medium">
                    View safe route options
                  </button>
                  <button className="text-sm text-primary font-medium">
                    Alert contacts
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
