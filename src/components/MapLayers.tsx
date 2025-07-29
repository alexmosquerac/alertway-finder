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
        title: incident.title,
        incident_time: incident.incident_time
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
  }, [map, recentIncidents]);

  // Add click handlers for incidents
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const handleIncidentClick = (e: any) => {
      if (e.features && e.features.length > 0 && onIncidentClick) {
        const incident = recentIncidents.find(inc => inc.id === e.features[0].properties.id);
        if (incident) {
          onIncidentClick(incident);
        }
      }
    };

    // Add click event to incidents layer
    map.on('click', 'incidents-layer', handleIncidentClick);
    
    // Change cursor on hover
    map.on('mouseenter', 'incidents-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'incidents-layer', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.off('click', 'incidents-layer', handleIncidentClick);
      map.off('mouseenter', 'incidents-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.off('mouseleave', 'incidents-layer', () => {
        map.getCanvas().style.cursor = '';
      });
    };
  }, [map, recentIncidents, onIncidentClick]);

  return null;
};

export default MapLayers;