
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Search, Navigation, Map, Route, AlertCircle, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Routes = () => {
  const [fromLocation, setFromLocation] = useState("Current Location");
  const [toLocation, setToLocation] = useState("");
  const [showRoutes, setShowRoutes] = useState(false);
  
  const handleSearch = () => {
    if (toLocation) {
      setShowRoutes(true);
    }
  };
  
  // Simulated route data
  const routes = [
    { 
      id: 1, 
      name: "Safest Route",
      eta: "25 mins",
      distance: "1.8 miles",
      safetyScore: "High",
      scoreColor: "text-safety-safe",
      scoreClass: "safety-indicator safe",
      description: "Avoids all reported incident areas. Well-lit streets with high foot traffic.",
      icon: Shield,
    },
    { 
      id: 2, 
      name: "Fastest Route",
      eta: "18 mins",
      distance: "1.5 miles",
      safetyScore: "Medium",
      scoreColor: "text-safety-caution",
      scoreClass: "safety-indicator caution",
      description: "Passes through one area with minor reported incidents. Moderate foot traffic.",
      icon: Route,
    },
    { 
      id: 3, 
      name: "Alternative Route",
      eta: "22 mins",
      distance: "1.7 miles",
      safetyScore: "Medium-High",
      scoreColor: "text-safety-info",
      scoreClass: "safety-indicator info",
      description: "Well-lit route with good visibility. Several public businesses along the way.",
      icon: Map,
    }
  ];
  
  return (
    <MainLayout>
      <div className="p-4 h-full flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">Find Safe Routes</h1>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center p-3 bg-white rounded-xl shadow-elevation-low">
            <Navigation className="w-5 h-5 text-primary mr-3" />
            <input
              type="text"
              className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              placeholder="From"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
            />
          </div>
          
          <div className="flex items-center p-3 bg-white rounded-xl shadow-elevation-low">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              type="text"
              className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              placeholder="To"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
            />
          </div>
          
          <button
            onClick={handleSearch}
            className={cn(
              "w-full py-3 rounded-xl font-medium transition-all duration-300",
              "bg-primary text-primary-foreground",
              !toLocation && "opacity-50 pointer-events-none"
            )}
            disabled={!toLocation}
          >
            Find Routes
          </button>
        </div>
        
        {showRoutes ? (
          <div className="flex-1 overflow-auto">
            <h2 className="text-lg font-medium mb-3">Recommended Routes</h2>
            
            <div className="space-y-4">
              {routes.map((route) => (
                <div 
                  key={route.id}
                  className="border border-border rounded-xl overflow-hidden bg-white shadow-elevation-low animate-fade-in"
                  style={{ animationDelay: `${(route.id - 1) * 100}ms` }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <route.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{route.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{route.eta}</span>
                            <span className="mx-2">•</span>
                            <span>{route.distance}</span>
                          </div>
                        </div>
                      </div>
                      <span className={route.scoreClass}>
                        {route.safetyScore}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {route.description}
                    </p>
                    
                    <div className="flex justify-between">
                      <button className="text-sm text-primary font-medium">
                        View Details
                      </button>
                      <button className="flex items-center text-sm text-primary font-medium">
                        Start
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex animate-fade-in" style={{ animationDelay: '300ms' }}>
                <AlertCircle className="text-blue-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">About Safety Ratings</p>
                  <p>Routes are rated based on incident reports, lighting conditions, foot traffic, and proximity to safe zones.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Route className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-medium">Find Your Way Safely</h2>
            <p className="text-muted-foreground mt-1 max-w-xs">
              Enter your destination to get route options prioritized for safety.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Routes;
