
import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import ReportIncident from "@/components/ReportIncident";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, MapPin, Filter, Plus, User, Eye, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentReport {
  id: string;
  incident_type: string;
  description: string;
  latitude: number;
  longitude: number;
  incident_time: string;
  severity: string;
  status: string;
  is_verified: boolean;
  verification_count: number;
  created_at: string;
}

const Reports = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      setReports(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredReports = filter === "all" ? 
    reports : 
    reports.filter(report => 
      (filter === "verified" && report.is_verified) || 
      (filter === "unverified" && !report.is_verified) ||
      (filter === "high" && report.severity === "high")
    );
  
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "high":
        return "safety-indicator danger";
      case "medium":
        return "safety-indicator caution";
      case "low":
        return "safety-indicator info";
      default:
        return "safety-indicator info";
    }
  };
  
  const getIncidentIcon = (type: string) => {
    switch (type) {
      case "theft":
        return AlertTriangle;
      case "suspicious":
        return Eye;
      case "harassment":
        return User;
      case "vandalism":
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };
  
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "high":
        return "Alto";
      case "medium":
        return "Medio";
      case "low":
        return "Bajo";
      default:
        return "Bajo";
    }
  };
  
  const getTypeText = (type: string) => {
    switch (type) {
      case "theft":
        return "Robo";
      case "suspicious":
        return "Sospechoso";
      case "harassment":
        return "Acoso";
      case "vandalism":
        return "Vandalismo";
      default:
        return type;
    }
  };
  
  return (
    <MainLayout>
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Reportes de Incidentes</h1>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Reportar
          </button>
        </div>
        
        <div className="mb-4 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors",
                filter === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              Todos los Reportes
            </button>
            <button
              onClick={() => setFilter("verified")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors",
                filter === "verified" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              Solo Verificados
            </button>
            <button
              onClick={() => setFilter("high")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors",
                filter === "high" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              Gravedad Alta
            </button>
          </div>
        </div>
        
        {filteredReports.length > 0 ? (
          <div className="flex-1 overflow-auto">
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const IncidentIcon = getIncidentIcon(report.incident_type);
                
                return (
                  <div 
                    key={report.id} 
                    className="border border-border rounded-xl overflow-hidden bg-white shadow-elevation-low animate-fade-in"
                    style={{ animationDelay: `${filteredReports.indexOf(report) * 100}ms` }}
                  >
                    <div className="p-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mr-3 mt-1">
                          <IncidentIcon className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium">{getTypeText(report.incident_type)}</h3>
                            <span className={getSeverityClass(report.severity)}>
                              {getSeverityText(report.severity)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {report.description}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground">
                            <div className="flex items-center mr-4">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              <span>{new Date(report.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center mt-1 sm:mt-0">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              <span>{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                            </div>
                          </div>
                          {report.is_verified && (
                            <div className="mt-2 flex items-center">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 mr-1">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Verificado
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium">No se Encontraron Reportes</h2>
            <p className="text-muted-foreground mt-1 max-w-xs">
              No hay reportes de incidentes que coincidan con tu filtro actual.
            </p>
            <button
              onClick={() => setFilter("all")}
              className="mt-4 text-primary font-medium"
            >
              Ver Todos los Reportes
            </button>
          </div>
        )}
      </div>
      
      <ReportIncident
        isVisible={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={() => fetchReports()}
      />
    </MainLayout>
  );
};

export default Reports;
