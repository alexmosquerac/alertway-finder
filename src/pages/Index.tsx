
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import Map from "@/components/Map";
import SafetyAlert from "@/components/SafetyAlert";
import ReportIncident from "@/components/ReportIncident";
import MapboxToken from "@/components/MapboxToken";
import { AlertTriangle, Bell } from "lucide-react";

const Index = () => {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Safety alerts banner */}
        <div className="px-4 py-3 bg-safety-info/10 flex items-center justify-between animate-fade-in">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-safety-info mr-2" />
            <span className="text-sm font-medium">Safety alerts enabled for your area</span>
          </div>
          <button className="text-xs font-medium text-primary">
            Settings
          </button>
        </div>
        
        {/* Main map view */}
        <div className="flex-1 relative">
          <Map />
          
          {/* Emergency button */}
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-destructive text-white px-6 py-3 rounded-full font-medium shadow-elevation-medium flex items-center animate-pulse-subtle"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Emergency Alert
          </button>
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
      
      {/* Mapbox token input */}
      <MapboxToken />
    </MainLayout>
  );
};

export default Index;
