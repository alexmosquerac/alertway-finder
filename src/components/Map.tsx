
import { useRef, useEffect, useState } from "react";
import { Search, Navigation, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Safety markers data (would come from API in real app)
const safetyMarkers = [
  { id: 1, coordinates: [-73.9712, 40.7831], level: 'safe', label: 'Central Park Area' },
  { id: 2, coordinates: [-73.9862, 40.7580], level: 'caution', label: 'Times Square' },
  { id: 3, coordinates: [-73.9787, 40.7425], level: 'danger', label: 'Midtown East' },
  { id: 4, coordinates: [-73.9935, 40.7411], level: 'safe', label: 'Chelsea' },
  { id: 5, coordinates: [-74.0060, 40.7314], level: 'caution', label: 'Greenwich Village' },
];

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [safetyLevel, setSafetyLevel] = useState<'safe' | 'caution' | 'danger' | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<typeof safetyMarkers[0] | null>(null);
  
  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("mapbox_token");
    if (!token || !mapContainer.current) return;
    
    // Initialize Mapbox
    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-73.9865, 40.7535], // New York City
      zoom: 12
    });
    
    const mapInstance = map.current;
    
    // Add navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Handle map load
    mapInstance.on('load', () => {
      setMapLoaded(true);
      
      // Add markers when map is ready
      safetyMarkers.forEach(marker => {
        // Create marker element
        const el = document.createElement('div');
        el.className = `marker-${marker.level}`;
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        
        // Set background color based on safety level
        el.style.backgroundColor = 
          marker.level === 'safe' ? 'rgba(34, 197, 94, 0.2)' : 
          marker.level === 'caution' ? 'rgba(245, 158, 11, 0.2)' : 
          'rgba(239, 68, 68, 0.2)';

        // Add icon based on safety level
        const icon = document.createElement('span');
        icon.innerHTML = 
          marker.level === 'safe' 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(34, 197, 94)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' 
            : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + (marker.level === 'caution' ? 'rgb(245, 158, 11)' : 'rgb(239, 68, 68)') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
        el.appendChild(icon);
        
        // Add click handler
        el.addEventListener('click', () => {
          setSelectedMarker(marker);
          setSafetyLevel(marker.level as 'safe' | 'caution' | 'danger');
        });
        
        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat(marker.coordinates)
          .addTo(mapInstance);
      });
    });
    
    // Get user location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          
          // Add user location marker
          const userEl = document.createElement('div');
          userEl.className = 'user-location';
          userEl.style.width = '20px';
          userEl.style.height = '20px';
          userEl.style.borderRadius = '50%';
          userEl.style.backgroundColor = '#3b82f6';
          userEl.style.border = '2px solid white';
          userEl.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
          
          new mapboxgl.Marker(userEl)
            .setLngLat([longitude, latitude])
            .addTo(mapInstance);
            
          // Center map on user location
          mapInstance.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            speed: 1.5
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
    
    // Cleanup on unmount
    return () => {
      mapInstance.remove();
    };
  }, []);
  
  // Handle current location button click
  const goToUserLocation = () => {
    if (!map.current) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            speed: 1.5
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
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
        ref={mapContainer} 
        className="absolute inset-0 bg-muted"
      ></div>
      
      {/* Current location button */}
      <button 
        className="action-button absolute bottom-28 right-4 bg-white text-primary"
        aria-label="Current location"
        onClick={goToUserLocation}
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
      {safetyLevel && selectedMarker && (
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
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {selectedMarker.label}
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
