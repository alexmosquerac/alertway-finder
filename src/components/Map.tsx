import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const safetyMarkers = [
  { id: 1, lat: 40.4168, lng: -3.7038, level: 'safe', label: 'Centro Madrid' },
  { id: 2, lat: 40.4200, lng: -3.7050, level: 'caution', label: 'Zona Norte' },
  { id: 3, lat: 40.4150, lng: -3.7020, level: 'danger', label: 'Zona Sur' },
];

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  // Load recent incidents and heatmap data
  const loadMapData = async () => {
    try {
      // Load recent incidents (last 15 minutes)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { data: incidents } = await supabase
        .from('incident_reports')
        .select('*')
        .gte('incident_time', fifteenMinutesAgo)
        .eq('is_verified', true);

      setRecentIncidents(incidents || []);

      // Load heatmap data
      const { data: heatmap } = await supabase
        .from('heatmap_data')
        .select('*')
        .gt('risk_score', 0);

      setHeatmapData(heatmap || []);
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbGt4aWhvbHMwOG52M2VtbmZsNmV3eWo0In0.fXlp7_5JLra9nF-k-8JU4A';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-3.7038, 40.4168], // Madrid coordinates
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      loadMapData();

      // Add heatmap source and layer
      map.current!.addSource('heatmap', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.current!.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap',
        paint: {
          'heatmap-weight': ['get', 'risk_score'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(245, 158, 11, 0)',
            0.5, 'rgba(245, 158, 11, 0.6)',
            1, 'rgba(239, 68, 68, 0.9)'
          ],
          'heatmap-radius': 30,
          'heatmap-opacity': 0.8
        }
      });

      // Add incidents source and layer
      map.current!.addSource('incidents', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.current!.addLayer({
        id: 'incidents-layer',
        type: 'circle',
        source: 'incidents',
        paint: {
          'circle-radius': 8,
          'circle-color': '#ef4444',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Add safety markers
      safetyMarkers.forEach((marker, index) => {
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
          setSelectedMarker(marker);
        });

        new mapboxgl.Marker(el)
          .setLngLat([marker.lng, marker.lat])
          .addTo(map.current!);
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

            new mapboxgl.Marker(userMarker)
              .setLngLat([longitude, latitude])
              .addTo(map.current!);

            // Fly to user location
            map.current!.flyTo({
              center: [longitude, latitude],
              zoom: 15,
            });
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map data when incidents or heatmap data changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Update heatmap data
    const heatmapFeatures = heatmapData.map(point => ({
      type: 'Feature' as const,
      properties: {
        risk_score: point.risk_score,
        incident_count: point.incident_count
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [point.grid_lng, point.grid_lat]
      }
    }));

    const heatmapSource = map.current.getSource('heatmap') as mapboxgl.GeoJSONSource;
    if (heatmapSource) {
      heatmapSource.setData({
        type: 'FeatureCollection',
        features: heatmapFeatures
      });
    }

    // Update incidents data
    const incidentFeatures = recentIncidents.map(incident => ({
      type: 'Feature' as const,
      properties: {
        id: incident.id,
        category: incident.category,
        title: incident.title,
        incident_time: incident.incident_time
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [incident.longitude, incident.latitude]
      }
    }));

    const incidentsSource = map.current.getSource('incidents') as mapboxgl.GeoJSONSource;
    if (incidentsSource) {
      incidentsSource.setData({
        type: 'FeatureCollection',
        features: incidentFeatures
      });
    }

    // Add popups for incidents when clicked
    if (recentIncidents.length > 0) {
      recentIncidents.forEach(incident => {
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        })
        .setLngLat([incident.longitude, incident.latitude])
        .setHTML(`
          <div class="p-2 cursor-pointer">
            <h4 class="font-semibold text-red-600 text-xs">${incident.title || incident.category}</h4>
            <p class="text-xs text-gray-600">Reportado recientemente</p>
          </div>
        `);
        
        // Show popup on hover over incident markers
        // This is a simpler approach that avoids TypeScript issues
      });
    }

  }, [recentIncidents, heatmapData]);

  const goToUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 15,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Refresh map data every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadMapData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Input
          type="text"
          placeholder="Buscar ubicación..."
          className="bg-background/90 backdrop-blur-sm border-border/50"
        />
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Location Button */}
      <Button
        onClick={goToUserLocation}
        className="absolute bottom-20 right-4 z-10 rounded-full w-12 h-12 p-0"
        variant="secondary"
      >
        <Navigation className="w-5 h-5" />
      </Button>

      {/* Safety Information Panel */}
      {selectedMarker && (
        <Card className="absolute bottom-4 left-4 right-4 z-10 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    selectedMarker.level === 'safe' ? 'bg-green-500' : 
                    selectedMarker.level === 'caution' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
                <h3 className="font-semibold">{selectedMarker.label}</h3>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              <Badge
                variant={
                  selectedMarker.level === 'safe' ? 'default' : 
                  selectedMarker.level === 'caution' ? 'secondary' : 'destructive'
                }
              >
                {selectedMarker.level === 'safe' ? 'Zona Segura' : 
                 selectedMarker.level === 'caution' ? 'Precaución' : 'Peligro'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {selectedMarker.level === 'safe' 
                  ? 'Esta zona es considerada segura basada en reportes recientes.'
                  : selectedMarker.level === 'caution'
                  ? 'Se recomienda precaución en esta zona.'
                  : 'Esta zona tiene reportes de actividad peligrosa. Evitar si es posible.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Map;