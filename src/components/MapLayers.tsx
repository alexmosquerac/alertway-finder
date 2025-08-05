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

    // Update layer style based on severity
    if (map.getLayer('incidents-layer')) {
      map.setPaintProperty('incidents-layer', 'circle-color', [
        'case',
        ['==', ['get', 'severity'], 'high'], '#ef4444', // Rojo para alta gravedad
        ['==', ['get', 'severity'], 'medium'], '#f59e0b', // Amarillo para media gravedad
        '#22c55e' // Verde para baja gravedad
      ]);
    }
  }, [map, recentIncidents]);

  // Add click handlers for incidents
  useEffect(() => {
    if (!map || !map.isStyleLoaded() || !onIncidentClick) return;

    const handleIncidentClick = (e: any) => {
      // Prevent map navigation
      e.preventDefault();
      
      if (e.features && e.features.length > 0) {
        const clickedFeature = e.features[0];
        const incidentId = clickedFeature.properties.id;
        
        console.log('Clicked incident ID:', incidentId);
        console.log('Available incidents:', recentIncidents.map(i => i.id));
        
        const incident = recentIncidents.find(inc => inc.id === incidentId);
        if (incident) {
          console.log('Found incident:', incident);
          onIncidentClick(incident);
        } else {
          console.warn('Incident not found:', incidentId);
        }
      }
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    // Clean up any existing listeners
    const layerId = 'incidents-layer';
    if (map.getLayer(layerId)) {
      // Remove all listeners for this layer
      const existingListeners = (map as any)._listeners;
      if (existingListeners && existingListeners[layerId]) {
        delete existingListeners[layerId];
      }
    }

    // Add fresh listeners
    map.on('click', 'incidents-layer', handleIncidentClick);
    map.on('mouseenter', 'incidents-layer', handleMouseEnter);
    map.on('mouseleave', 'incidents-layer', handleMouseLeave);

    return () => {
      if (map.getLayer('incidents-layer')) {
        map.off('click', 'incidents-layer', handleIncidentClick);
        map.off('mouseenter', 'incidents-layer', handleMouseEnter);
        map.off('mouseleave', 'incidents-layer', handleMouseLeave);
      }
    };
  }, [map, recentIncidents, onIncidentClick]);

  return null;
};

export default MapLayers;