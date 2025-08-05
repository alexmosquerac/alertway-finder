import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface IncidentPopupProps {
  incident: any;
  onClose: () => void;
}

const IncidentPopup: React.FC<IncidentPopupProps> = ({ incident, onClose }) => {
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';     // Peligro - Rojo
      case 'medium': return 'bg-yellow-500'; // Precaución - Amarillo  
      case 'low': return 'bg-green-500';    // Leve - Verde
      default: return 'bg-gray-500';
    }
  };

  const getTitle = (incident: any) => {
    if (incident.title) return incident.title;
    return `${getCategoryLabel(incident.category)} reportado`;
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 z-30 md:bottom-6 md:left-6 md:right-auto md:max-w-sm">
      <Card className="bg-background/98 backdrop-blur-md border-border shadow-xl animate-slide-up">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${getSeverityColor(incident.severity)} shadow-sm`} />
              <div>
                <h3 className="font-semibold text-base text-foreground">{getCategoryLabel(incident.category)}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(incident.incident_time).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit', 
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted/70 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <Badge 
              variant={incident.severity === 'high' ? 'destructive' : 
                      incident.severity === 'medium' ? 'secondary' : 'default'}
              className="text-sm px-3 py-1"
            >
              {incident.severity === 'high' ? '🔴 Peligro' :
               incident.severity === 'medium' ? '🟡 Precaución' : '🟢 Leve'}
            </Badge>
            
            <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
              {incident.description}
            </p>
            
            <div className="flex items-center text-sm text-muted-foreground bg-muted/20 p-2 rounded-md">
              <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {incident.latitude?.toFixed(6)}, {incident.longitude?.toFixed(6)}
              </span>
            </div>
            
            {!incident.is_verified && (
              <div className="flex items-center text-sm text-orange-600 bg-orange-50 p-2 rounded-md">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Reporte pendiente de verificación</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentPopup;