import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useMapbox } from '@/hooks/useMapbox';
import MapControls from './MapControls';
import MapLayers from './MapLayers';
import MapMarkers, { SafetyMarker } from './MapMarkers';

const safetyMarkers: SafetyMarker[] = [
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
  const { token: mapboxToken, loading: tokenLoading, error: tokenError } = useMapbox();

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
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map with secure token
    mapboxgl.accessToken = mapboxToken;
    
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

    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);


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

  // Loading and error states
  if (tokenLoading) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error al cargar el mapa</p>
          <p className="text-sm text-muted-foreground">{tokenError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Controls */}
      <MapControls onLocationClick={goToUserLocation} />
      
      {/* Map Layers */}
      <MapLayers 
        map={map.current} 
        heatmapData={heatmapData} 
        recentIncidents={recentIncidents} 
      />
      
      {/* Map Markers */}
      <MapMarkers 
        map={map.current} 
        safetyMarkers={safetyMarkers} 
        onMarkerClick={setSelectedMarker} 
      />

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