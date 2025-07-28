import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapLayersProps {
  map: mapboxgl.Map | null;
  heatmapData: any[];
  recentIncidents: any[];
}

const MapLayers: React.FC<MapLayersProps> = ({ map, heatmapData, recentIncidents }) => {
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

  return null;
};

export default MapLayers;