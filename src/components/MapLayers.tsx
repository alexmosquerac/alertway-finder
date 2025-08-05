import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapLayersProps {
  map: mapboxgl.Map | null;
  heatmapData: any[];
  recentIncidents: any[];
  onIncidentClick?: (incident: any) => void;
}

const MapLayers: React.FC<MapLayersProps> = ({ map, heatmapData, recentIncidents, onIncidentClick }) => {
  // Update heatmap data
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

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

    const heatmapSource = map.getSource('heatmap') as mapboxgl.GeoJSONSource;
    if (heatmapSource) {
      heatmapSource.setData({
        type: 'FeatureCollection',
        features: heatmapFeatures
      });
    }
  }, [map, heatmapData]);

  // Update incidents data
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const incidentFeatures = recentIncidents.map(incident => ({
      type: 'Feature' as const,
      properties: {
        id: incident.id,
        category: incident.category,
        severity: incident.severity,
        title: incident.title,
        incident_time: incident.incident_time,
        description: incident.description,
        is_verified: incident.is_verified
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [incident.longitude, incident.latitude]
      }
    }));

    const incidentsSource = map.getSource('incidents') as mapboxgl.GeoJSONSource;
    if (incidentsSource) {
      incidentsSource.setData({
        type: 'FeatureCollection',
        features: incidentFeatures
      });
    }

    // Update layer style based on severity with better color mapping
    if (map.getLayer('incidents-layer')) {
      map.setPaintProperty('incidents-layer', 'circle-color', [
        'case',
        ['==', ['get', 'severity'], 'high'], '#ef4444', // Rojo para alta gravedad
        ['==', ['get', 'severity'], 'medium'], '#f59e0b', // Amarillo para media gravedad
        ['==', ['get', 'severity'], 'low'], '#22c55e', // Verde para baja gravedad
        '#f59e0b' // Default: amarillo para undefined
      ]);
      
      // Make circles larger and more visible
      map.setPaintProperty('incidents-layer', 'circle-radius', [
        'case',
        ['==', ['get', 'severity'], 'high'], 10,
        ['==', ['get', 'severity'], 'medium'], 8,
        6
      ]);
      
      map.setPaintProperty('incidents-layer', 'circle-stroke-width', 3);
      map.setPaintProperty('incidents-layer', 'circle-stroke-color', '#ffffff');
    }
  }, [map, recentIncidents]);

  // Add click handlers for incidents with better cleanup
  useEffect(() => {
    if (!map || !map.isStyleLoaded() || !onIncidentClick) return;

    const handleIncidentClick = (e: mapboxgl.MapLayerMouseEvent & { features?: any[] }) => {
      // Stop event propagation
      e.originalEvent?.stopPropagation();
      
      if (e.features && e.features.length > 0) {
        const clickedFeature = e.features[0];
        const incidentId = clickedFeature.properties?.id;
        
        console.log('Clicked incident ID:', incidentId);
        console.log('Available incidents:', recentIncidents.length);
        
        const incident = recentIncidents.find(inc => inc.id === incidentId);
        if (incident) {
          console.log('Found incident, showing popup:', incident.description);
          onIncidentClick(incident);
        } else {
          console.warn('Incident not found for ID:', incidentId);
        }
      }
    };

    const handleMouseEnter = () => {
      if (map) map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      if (map) map.getCanvas().style.cursor = '';
    };

    // Ensure layer exists before adding listeners
    if (map.getLayer('incidents-layer')) {
      // Clean up existing listeners first
      map.off('click', 'incidents-layer', handleIncidentClick);
      map.off('mouseenter', 'incidents-layer', handleMouseEnter);
      map.off('mouseleave', 'incidents-layer', handleMouseLeave);
      
      // Add fresh listeners
      map.on('click', 'incidents-layer', handleIncidentClick);
      map.on('mouseenter', 'incidents-layer', handleMouseEnter);
      map.on('mouseleave', 'incidents-layer', handleMouseLeave);
    }

    return () => {
      if (map && map.getLayer('incidents-layer')) {
        map.off('click', 'incidents-layer', handleIncidentClick);
        map.off('mouseenter', 'incidents-layer', handleMouseEnter);
        map.off('mouseleave', 'incidents-layer', handleMouseLeave);
      }
    };
  }, [map, recentIncidents, onIncidentClick]);

  return null;
};

export default MapLayers;