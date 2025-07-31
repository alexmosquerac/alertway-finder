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
    <Card className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm z-10 bg-card/98 backdrop-blur-md border shadow-elevation-high rounded-2xl animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getSeverityColor(incident.severity)}`} />
            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
              {getTitle(incident)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0 rounded-md hover:bg-muted/50"
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
              variant={incident.is_verified ? 'default' : 'secondary'}
              className="text-xs font-medium"
            >
              {getCategoryLabel(incident.category)}
            </Badge>
            {incident.is_verified ? (
              <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
                ✓ Verificado
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Pendiente
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={`text-xs border ${
                incident.severity === 'high' ? 'border-red-300 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-950' :
                incident.severity === 'medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:bg-yellow-950' :
                'border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-950'
              }`}
            >
              {incident.severity === 'high' ? '🔴 Peligro' :
               incident.severity === 'medium' ? '🟡 Precaución' : '🟢 Leve'}
            </Badge>
          </div>
          
          {incident.description && (
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {incident.description}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(incident.incident_time).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit', 
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="text-xs opacity-75">
              #{incident.id.slice(0, 8)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentPopup;