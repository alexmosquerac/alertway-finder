
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  MapPin, 
  AlertTriangle, 
  Route, 
  Phone, 
  Shield, 
  Settings 
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);
  
  const navItems = [
    { path: "/", icon: MapPin, label: "Mapa" },
    { path: "/routes", icon: Route, label: "Rutas" },
    { path: "/reports", icon: AlertTriangle, label: "Reportes" },
    { path: "/contacts", icon: Phone, label: "Contactos" },
    { path: "/tips", icon: Shield, label: "Consejos" },
    { path: "/settings", icon: Settings, label: "Ajustes" }
  ];

  return (
    <nav className="glass-panel mx-2 mb-2 rounded-2xl overflow-hidden py-2 px-2 shadow-elevation-medium">
      <ul className="flex items-center justify-around">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300",
                currentPath === item.path
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div 
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition-all duration-300",
                  currentPath === item.path ? "bg-primary/10" : "bg-transparent"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  currentPath === item.path ? "text-primary" : "text-muted-foreground"
                )} />
                
                {currentPath === item.path && (
                  <span className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium transition-all duration-300 hidden sm:block",
                currentPath === item.path ? "opacity-100" : "opacity-70"
              )}>
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
