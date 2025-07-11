
import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Search, Navigation, Map, Route, AlertCircle, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Routes = () => {
  const [fromLocation, setFromLocation] = useState("Ubicación Actual");
  const [toLocation, setToLocation] = useState("");
  const [showRoutes, setShowRoutes] = useState(false);
  
  const handleSearch = () => {
    if (toLocation) {
      setShowRoutes(true);
    }
  };
  
  // Datos de rutas simuladas
  const routes = [
    { 
      id: 1, 
      name: "Ruta Más Segura",
      eta: "25 min",
      distance: "1,8 km",
      safetyScore: "Alto",
      scoreColor: "text-safety-safe",
      scoreClass: "safety-indicator safe",
      description: "Evita todas las zonas con incidentes reportados. Calles bien iluminadas con mucho tránsito peatonal.",
      icon: Shield,
    },
    { 
      id: 2, 
      name: "Ruta Más Rápida",
      eta: "18 min",
      distance: "1,5 km",
      safetyScore: "Medio",
      scoreColor: "text-safety-caution",
      scoreClass: "safety-indicator caution",
      description: "Pasa por una zona con incidentes menores reportados. Tránsito peatonal moderado.",
      icon: Route,
    },
    { 
      id: 3, 
      name: "Ruta Alternativa",
      eta: "22 min",
      distance: "1,7 km",
      safetyScore: "Medio-Alto",
      scoreColor: "text-safety-info",
      scoreClass: "safety-indicator info",
      description: "Ruta bien iluminada con buena visibilidad. Varios comercios públicos en el camino.",
      icon: Map,
    }
  ];
  
  return (
    <MainLayout>
      <div className="p-4 h-full flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">Encontrar Rutas Seguras</h1>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center p-3 bg-white rounded-xl shadow-elevation-low">
            <Navigation className="w-5 h-5 text-primary mr-3" />
            <input
              type="text"
              className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              placeholder="Desde"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
            />
          </div>
          
          <div className="flex items-center p-3 bg-white rounded-xl shadow-elevation-low">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              type="text"
              className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              placeholder="Hasta"
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
            Buscar Rutas
          </button>
        </div>
        
        {showRoutes ? (
          <div className="flex-1 overflow-auto">
            <h2 className="text-lg font-medium mb-3">Rutas Recomendadas</h2>
            
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
                        Ver Detalles
                      </button>
                      <button className="flex items-center text-sm text-primary font-medium">
                        Iniciar
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex animate-fade-in" style={{ animationDelay: '300ms' }}>
                <AlertCircle className="text-blue-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Acerca de las Calificaciones de Seguridad</p>
                  <p>Las rutas se califican basándose en reportes de incidentes, condiciones de iluminación, tránsito peatonal y proximidad a zonas seguras.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Route className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-medium">Encuentra tu Camino de Forma Segura</h2>
            <p className="text-muted-foreground mt-1 max-w-xs">
              Introduce tu destino para obtener opciones de rutas priorizadas por seguridad.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Routes;
