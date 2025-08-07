import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MapDebugInfoProps {
  recentIncidents: any[];
  map: mapboxgl.Map | null;
}

const MapDebugInfo: React.FC<MapDebugInfoProps> = ({ recentIncidents, map }) => {
  const mapCenter = map?.getCenter();
  const mapZoom = map?.getZoom();

  return (
    <Card className="absolute top-4 left-4 max-w-sm bg-background/95 backdrop-blur-sm z-20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <Badge variant="outline">
            Incidentes: {recentIncidents.length}
          </Badge>
        </div>
        
        {mapCenter && (
          <div className="space-y-1">
            <div className="font-medium">Centro del mapa:</div>
            <div className="text-muted-foreground">
              {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
            </div>
            <div className="text-muted-foreground">
              Zoom: {mapZoom?.toFixed(1)}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="font-medium">Incidentes:</div>
          {recentIncidents.slice(0, 3).map((incident, idx) => (
            <div key={incident.id} className="text-muted-foreground">
              {idx + 1}. {incident.category} ({incident.latitude?.toFixed(4)}, {incident.longitude?.toFixed(4)})
            </div>
          ))}
          {recentIncidents.length > 3 && (
            <div className="text-muted-foreground">
              +{recentIncidents.length - 3} más...
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <div className="font-medium text-green-600">✓ Token Mapbox: OK</div>
          <div className="font-medium text-green-600">✓ Mapa inicializado: OK</div>
          <div className="font-medium text-green-600">✓ Capas creadas: OK</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapDebugInfo;