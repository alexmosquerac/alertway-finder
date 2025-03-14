
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import ReportIncident from "@/components/ReportIncident";
import { AlertTriangle, Clock, MapPin, Filter, Plus, User, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const Reports = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  
  // Simulated incident reports
  const reports = [
    {
      id: 1,
      type: "theft",
      description: "Reported theft of a bicycle that was locked outside the coffee shop.",
      time: "2 hours ago",
      location: "Main Street & 5th Avenue",
      severity: "medium",
      verified: true
    },
    {
      id: 2,
      type: "suspicious",
      description: "Suspicious person loitering around the park entrance for over an hour.",
      time: "Yesterday",
      location: "Central Park, East Entrance",
      severity: "low",
      verified: false
    },
    {
      id: 3,
      type: "harassment",
      description: "Verbal harassment reported near the bus station. Exercise caution in this area.",
      time: "Yesterday",
      location: "Downtown Transit Center",
      severity: "high",
      verified: true
    },
    {
      id: 4,
      type: "vandalism",
      description: "Multiple cars with broken windows reported in overnight incident.",
      time: "2 days ago",
      location: "Oak Street Parking Lot",
      severity: "medium",
      verified: true
    }
  ];
  
  const filteredReports = filter === "all" ? 
    reports : 
    reports.filter(report => 
      (filter === "verified" && report.verified) || 
      (filter === "unverified" && !report.verified) ||
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
  
  return (
    <MainLayout>
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Incident Reports</h1>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Report
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
              All Reports
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
              Verified Only
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
              High Severity
            </button>
          </div>
        </div>
        
        {filteredReports.length > 0 ? (
          <div className="flex-1 overflow-auto">
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const IncidentIcon = getIncidentIcon(report.type);
                
                return (
                  <div 
                    key={report.id} 
                    className="border border-border rounded-xl overflow-hidden bg-white shadow-elevation-low animate-fade-in"
                    style={{ animationDelay: `${(report.id - 1) * 100}ms` }}
                  >
                    <div className="p-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mr-3 mt-1">
                          <IncidentIcon className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium capitalize">{report.type}</h3>
                            <span className={getSeverityClass(report.severity)}>
                              {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {report.description}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground">
                            <div className="flex items-center mr-4">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              <span>{report.time}</span>
                            </div>
                            <div className="flex items-center mt-1 sm:mt-0">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              <span>{report.location}</span>
                            </div>
                          </div>
                          {report.verified && (
                            <div className="mt-2 flex items-center">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 mr-1">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Verified
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
            <h2 className="text-lg font-medium">No Reports Found</h2>
            <p className="text-muted-foreground mt-1 max-w-xs">
              There are no incident reports matching your current filter.
            </p>
            <button
              onClick={() => setFilter("all")}
              className="mt-4 text-primary font-medium"
            >
              View All Reports
            </button>
          </div>
        )}
      </div>
      
      <ReportIncident
        isVisible={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </MainLayout>
  );
};

export default Reports;
