import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

export interface SafetyMarker {
  id: number;
  lat: number;
  lng: number;
  level: 'safe' | 'caution' | 'danger';
  label: string;
}

interface MapMarkersProps {
  map: mapboxgl.Map | null;
  safetyMarkers: SafetyMarker[];
  onMarkerClick: (marker: SafetyMarker) => void;
}

const MapMarkers: React.FC<MapMarkersProps> = ({ map, safetyMarkers, onMarkerClick }) => {
  useEffect(() => {
    if (!map) return;

    const markers: mapboxgl.Marker[] = [];

    // Add safety markers
    safetyMarkers.forEach((marker) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundImage = `url(data:image/svg+xml;base64,${btoa(`
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" fill="${
            marker.level === 'safe' ? '#22c55e' : 
            marker.level === 'caution' ? '#f59e0b' : '#ef4444'
          }" stroke="white" stroke-width="2"/>
          <circle cx="15" cy="15" r="6" fill="white"/>
        </svg>
      `)})`;
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      el.addEventListener('click', () => {
        onMarkerClick(marker);
      });

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .addTo(map);

      markers.push(mapboxMarker);
    });

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Create user location marker
          const userMarker = document.createElement('div');
          userMarker.className = 'user-location-marker';
          userMarker.style.backgroundImage = `url(data:image/svg+xml;base64,${btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
              <circle cx="10" cy="10" r="3" fill="white"/>
            </svg>
          `)})`;
          userMarker.style.width = '20px';
          userMarker.style.height = '20px';
          userMarker.style.backgroundSize = 'cover';

          const userMapboxMarker = new mapboxgl.Marker(userMarker)
            .setLngLat([longitude, latitude])
            .addTo(map);

          markers.push(userMapboxMarker);

          // Fly to user location
          map.flyTo({
            center: [longitude, latitude],
            zoom: 15,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Cleanup function
    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [map, safetyMarkers, onMarkerClick]);

  return null;
};

export default MapMarkers;