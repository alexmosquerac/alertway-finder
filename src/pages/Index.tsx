
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import Map from "@/components/Map";
import SafetyAlert from "@/components/SafetyAlert";
import ReportIncident from "@/components/ReportIncident";
import { AlertTriangle, Bell, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Index = () => {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Banner de alertas de seguridad */}
        <div className="px-4 py-3 bg-safety-info/10 flex items-center justify-between animate-fade-in">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-safety-info mr-2" />
            <span className="text-sm font-medium">Alertas de seguridad activadas para tu zona</span>
          </div>
          <div className="flex items-center gap-2">
            {!user ? (
              <Link 
                to="/auth" 
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </Link>
            ) : (
              <button className="text-xs font-medium text-primary">
                Configuración
              </button>
            )}
          </div>
        </div>
        
        {/* Vista principal del mapa */}
        <div className="flex-1 relative">
          <Map />
          
          {/* Botones de acción */}
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex gap-3">
            {/* Botón de reportar incidente */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-safety-caution text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full font-medium shadow-elevation-medium flex items-center text-sm sm:text-base hover:bg-safety-caution/90 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Reportar
            </button>
            
            {/* Botón de emergencia */}
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="bg-destructive text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full font-medium shadow-elevation-medium flex items-center animate-pulse-subtle text-sm sm:text-base"
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Emergencia
            </button>
          </div>
        </div>
      </div>
      
      <SafetyAlert 
        isVisible={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
      
      <ReportIncident
        isVisible={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </MainLayout>
  );
};

export default Index;
