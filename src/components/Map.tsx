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
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const { token: mapboxToken, loading: tokenLoading, error: tokenError } = useMapbox();

  // Load recent incidents and heatmap data
  const loadMapData = async () => {
    try {
      // Load recent incidents (last 4 hours) - incluir todos los reportes, verificados o no
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      const { data: incidents, error: incidentsError } = await supabase
        .from('incident_reports')
        .select('*')
        .gte('incident_time', fourHoursAgo)
        .order('incident_time', { ascending: false });

      if (incidentsError) {
        console.error('Error loading incidents:', incidentsError);
      }

      setRecentIncidents(incidents || []);
      console.log('Loaded incidents:', incidents);

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

  // Set up real-time updates for incidents
  useEffect(() => {
    const channel = supabase
      .channel('incident-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incident_reports'
        },
        (payload) => {
          console.log('New incident received:', payload);
          // Add new incident to the map in real-time
          if (payload.new) {
            setRecentIncidents(prev => {
              // Evitar duplicados
              const exists = prev.find(incident => incident.id === payload.new.id);
              if (!exists) {
                console.log('Adding new incident to map:', payload.new);
                return [payload.new as any, ...prev];
              }
              return prev;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'incident_reports'
        },
        (payload) => {
          console.log('Updated incident received:', payload);
          // Update incident in real-time
          if (payload.new) {
            setRecentIncidents(prev => 
              prev.map(incident => 
                incident.id === payload.new.id ? payload.new as any : incident
              )
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Refresh map data every 20 seconds as backup and on mount
    loadMapData();
    const interval = setInterval(loadMapData, 20000);
    
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
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
        onIncidentClick={setSelectedIncident}
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

      {/* Incident Information Panel - Responsive Bubble */}
      {selectedIncident && (
        <Card className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm z-10 bg-card/98 backdrop-blur-md border shadow-elevation-high rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  selectedIncident.category === 'theft' ? 'bg-red-500' :
                  selectedIncident.category === 'assault' ? 'bg-red-600' :
                  selectedIncident.category === 'harassment' ? 'bg-orange-500' :
                  selectedIncident.category === 'suspicious' ? 'bg-yellow-500' :
                  selectedIncident.category === 'vandalism' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} />
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                  {selectedIncident.title || 
                   (selectedIncident.category === 'theft' ? 'Robo reportado' :
                    selectedIncident.category === 'assault' ? 'Agresión reportada' :
                    selectedIncident.category === 'harassment' ? 'Acoso reportado' :
                    selectedIncident.category === 'suspicious' ? 'Actividad sospechosa' :
                    selectedIncident.category === 'vandalism' ? 'Vandalismo reportado' :
                    'Incidente reportado')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={selectedIncident.is_verified ? 'default' : 'secondary'}
                  className="text-xs font-medium"
                >
                  {selectedIncident.category === 'theft' ? 'Robo' :
                   selectedIncident.category === 'assault' ? 'Agresión' :
                   selectedIncident.category === 'harassment' ? 'Acoso' :
                   selectedIncident.category === 'suspicious' ? 'Sospechoso' :
                   selectedIncident.category === 'vandalism' ? 'Vandalismo' :
                   'Otro'}
                </Badge>
                {selectedIncident.is_verified ? (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-200">
                    ✓ Verificado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Pendiente
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {selectedIncident.severity === 'high' ? 'Alta' :
                   selectedIncident.severity === 'medium' ? 'Media' : 'Baja'} severidad
                </Badge>
              </div>
              
              {selectedIncident.description && (
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedIncident.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(selectedIncident.incident_time).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit', 
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="text-xs opacity-75">
                  #{selectedIncident.id.slice(0, 8)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Map;