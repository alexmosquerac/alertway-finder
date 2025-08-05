import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface CriticalZonesProps {
  map: mapboxgl.Map | null;
  recentIncidents: any[];
}

const CriticalZones: React.FC<CriticalZonesProps> = ({ map, recentIncidents }) => {
  // Calcular zonas críticas basadas en densidad de incidentes (tipo Waze)
  useEffect(() => {
    if (!map || !map.isStyleLoaded() || recentIncidents.length === 0) return;

    // Agrupar incidentes por proximidad geográfica
    const clusters = createIncidentClusters(recentIncidents);
    
    // Crear características de zonas críticas
    const criticalZoneFeatures = clusters
      .filter(cluster => cluster.incidents.length >= 2) // Mínimo 2 incidentes para considerar zona crítica
      .map(cluster => {
        const severity = calculateClusterSeverity(cluster.incidents);
        return {
          type: 'Feature' as const,
          properties: {
            incident_count: cluster.incidents.length,
            severity_level: severity,
            risk_score: cluster.incidents.length * (severity === 'high' ? 3 : severity === 'medium' ? 2 : 1)
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [cluster.centerLng, cluster.centerLat]
          }
        };
      });

    // Actualizar fuente de zonas críticas
    const criticalZonesSource = map.getSource('critical-zones') as mapboxgl.GeoJSONSource;
    if (criticalZonesSource) {
      criticalZonesSource.setData({
        type: 'FeatureCollection',
        features: criticalZoneFeatures
      });
    } else {
      // Crear fuente si no existe
      map.addSource('critical-zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: criticalZoneFeatures
        }
      });

      // Agregar capa de zonas críticas con efecto de área de influencia
      map.addLayer({
        id: 'critical-zones-area',
        type: 'circle',
        source: 'critical-zones',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'risk_score'],
            2, 40,   // Mínimo radio
            10, 80   // Máximo radio
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'severity_level'], 'high'], 'rgba(239, 68, 68, 0.3)',
            ['==', ['get', 'severity_level'], 'medium'], 'rgba(245, 158, 11, 0.3)',
            'rgba(34, 197, 94, 0.2)'
          ],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'severity_level'], 'high'], '#ef4444',
            ['==', ['get', 'severity_level'], 'medium'], '#f59e0b',
            '#22c55e'
          ],
          'circle-stroke-width': 2,
          'circle-opacity': 0.7
        }
      }, 'incidents-layer'); // Insertar antes de la capa de incidentes

      // Agregar capa de texto para mostrar número de incidentes
      map.addLayer({
        id: 'critical-zones-labels',
        type: 'symbol',
        source: 'critical-zones',
        layout: {
          'text-field': ['get', 'incident_count'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 14,
          'text-offset': [0, 0],
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });
    }
  }, [map, recentIncidents]);

  return null;
};

// Función para agrupar incidentes por proximidad
function createIncidentClusters(incidents: any[], radiusKm = 0.5) {
  const clusters: Array<{
    centerLat: number;
    centerLng: number;
    incidents: any[];
  }> = [];

  incidents.forEach(incident => {
    if (!incident.latitude || !incident.longitude) return;

    // Buscar cluster existente dentro del radio
    let assignedCluster = clusters.find(cluster => {
      const distance = calculateDistance(
        incident.latitude,
        incident.longitude,
        cluster.centerLat,
        cluster.centerLng
      );
      return distance <= radiusKm;
    });

    if (assignedCluster) {
      // Agregar al cluster existente y recalcular centro
      assignedCluster.incidents.push(incident);
      const avgLat = assignedCluster.incidents.reduce((sum, inc) => sum + inc.latitude, 0) / assignedCluster.incidents.length;
      const avgLng = assignedCluster.incidents.reduce((sum, inc) => sum + inc.longitude, 0) / assignedCluster.incidents.length;
      assignedCluster.centerLat = avgLat;
      assignedCluster.centerLng = avgLng;
    } else {
      // Crear nuevo cluster
      clusters.push({
        centerLat: incident.latitude,
        centerLng: incident.longitude,
        incidents: [incident]
      });
    }
  });

  return clusters;
}

// Función para calcular la distancia entre dos puntos en km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Función para calcular la severidad del cluster
function calculateClusterSeverity(incidents: any[]): 'low' | 'medium' | 'high' {
  const severityScores = incidents.map(incident => {
    switch (incident.severity) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  });

  const avgSeverity = severityScores.reduce((sum, score) => sum + score, 0) / severityScores.length;
  
  if (avgSeverity >= 2.5) return 'high';
  if (avgSeverity >= 1.5) return 'medium';
  return 'low';
}

export default CriticalZones;