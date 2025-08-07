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

  // Add click handlers using native Mapbox popups for better reliability
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    // Remove existing popups
    const existingPopups = document.querySelectorAll('.mapboxgl-popup');
    existingPopups.forEach(popup => popup.remove());

    const handleIncidentClick = (e: mapboxgl.MapLayerMouseEvent & { features?: any[] }) => {
      e.preventDefault();
      
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const props = feature.properties;
        
        if (!props) return;

        // Create popup content
        const getSeverityColor = (severity: string) => {
          switch (severity) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b'; 
            case 'low': return '#22c55e';
            default: return '#6b7280';
          }
        };

        const getSeverityLabel = (severity: string) => {
          switch (severity) {
            case 'high': return '🔴 Peligro';
            case 'medium': return '🟡 Precaución';
            case 'low': return '🟢 Leve';
            default: return '⚫ Desconocido';
          }
        };

        const getCategoryLabel = (category: string) => {
          switch (category) {
            case 'theft': return 'Robo';
            case 'assault': return 'Agresión';
            case 'harassment': return 'Acoso';
            case 'suspicious': return 'Sospechoso';
            case 'vandalism': return 'Vandalismo';
            default: return 'Otro';
          }
        };

        const popupContent = `
          <div style="max-width: 300px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; align-items: center; margin-bottom: 12px; gap: 8px;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${getSeverityColor(props.severity)}; flex-shrink: 0;"></div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">${getCategoryLabel(props.category)}</h3>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 500; color: #374151;">
              ${getSeverityLabel(props.severity)}
            </div>
            
            <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.5; color: #4b5563; background-color: #f9fafb; padding: 12px; border-radius: 8px;">
              ${props.description || 'Sin descripción disponible'}
            </p>
            
            <div style="font-size: 12px; color: #6b7280; background-color: #f3f4f6; padding: 8px; border-radius: 6px;">
              <div style="margin-bottom: 4px;">
                📅 ${new Date(props.incident_time).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              ${!props.is_verified ? '<div style="color: #ea580c; font-weight: 500;">⚠️ Pendiente de verificación</div>' : ''}
            </div>
          </div>
        `;

        // Create and show popup
        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          maxWidth: '320px',
          className: 'incident-popup'
        })
          .setLngLat(e.lngLat)
          .setHTML(popupContent)
          .addTo(map);

        console.log('Native popup created for incident:', props.category);
      }
    };

    const handleMouseEnter = () => {
      if (map) map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      if (map) map.getCanvas().style.cursor = '';
    };

    // Add event listeners
    if (map.getLayer('incidents-layer')) {
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
  }, [map, recentIncidents]);

  return null;
};

export default MapLayers;