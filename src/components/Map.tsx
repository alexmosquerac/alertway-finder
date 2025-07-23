
import { useRef, useEffect, useState } from "react";
import { Search, Navigation, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Datos de marcadores de seguridad (vendrían de la API en una app real)
const safetyMarkers = [
  { id: 1, coordinates: [-3.7038, 40.4168] as [number, number], level: 'safe', label: 'Parque del Retiro' },
  { id: 2, coordinates: [-3.7076, 40.4173] as [number, number], level: 'caution', label: 'Puerta del Sol' },
  { id: 3, coordinates: [-3.6923, 40.4211] as [number, number], level: 'danger', label: 'Chueca' },
  { id: 4, coordinates: [-3.7147, 40.4206] as [number, number], level: 'safe', label: 'Malasaña' },
  { id: 5, coordinates: [-3.7026, 40.4095] as [number, number], level: 'caution', label: 'Atocha' },
];

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [safetyLevel, setSafetyLevel] = useState<'safe' | 'caution' | 'danger' | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<typeof safetyMarkers[0] | null>(null);
  
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Inicializar Mapbox con el token
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxleG1vc3F1ZXJhIiwiYSI6ImNtODh1bmRjZzA5bHkyanIxY2c5dGhsZHkifQ.ZbTChx2hWzdNMXKiGuD82A';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-3.7038, 40.4168], // Madrid, España
      zoom: 12
    });
    
    const mapInstance = map.current;
    
    // Añadir controles de navegación
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Manejar carga del mapa
    mapInstance.on('load', () => {
      setMapLoaded(true);
      
      // Añadir marcadores cuando el mapa esté listo
      safetyMarkers.forEach(marker => {
        // Crear elemento del marcador
        const el = document.createElement('div');
        el.className = `marker-${marker.level}`;
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        
        // Establecer color de fondo según el nivel de seguridad
        el.style.backgroundColor = 
          marker.level === 'safe' ? 'rgba(34, 197, 94, 0.2)' : 
          marker.level === 'caution' ? 'rgba(245, 158, 11, 0.2)' : 
          'rgba(239, 68, 68, 0.2)';

        // Añadir icono según el nivel de seguridad
        const icon = document.createElement('span');
        icon.innerHTML = 
          marker.level === 'safe' 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(34, 197, 94)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' 
            : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + (marker.level === 'caution' ? 'rgb(245, 158, 11)' : 'rgb(239, 68, 68)') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
        el.appendChild(icon);
        
        // Añadir manejador de click
        el.addEventListener('click', () => {
          setSelectedMarker(marker);
          setSafetyLevel(marker.level as 'safe' | 'caution' | 'danger');
        });
        
        // Añadir marcador al mapa
        new mapboxgl.Marker(el)
          .setLngLat(marker.coordinates)
          .addTo(mapInstance);
      });
    });
    
    // Obtener ubicación del usuario si está disponible
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          
          // Añadir marcador de ubicación del usuario
          const userEl = document.createElement('div');
          userEl.className = 'user-location';
          userEl.style.width = '20px';
          userEl.style.height = '20px';
          userEl.style.borderRadius = '50%';
          userEl.style.backgroundColor = '#3b82f6';
          userEl.style.border = '2px solid white';
          userEl.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
          
          new mapboxgl.Marker(userEl)
            .setLngLat([longitude, latitude])
            .addTo(mapInstance);
            
          // Centrar mapa en la ubicación del usuario
          mapInstance.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            speed: 1.5
          });
        },
        (error) => {
          console.error('Error obteniendo la ubicación:', error);
        }
      );
    }
    
    // Limpiar al desmontar
    return () => {
      mapInstance.remove();
    };
  }, []);
  
  // Manejar click del botón de ubicación actual
  const goToUserLocation = () => {
    if (!map.current) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            speed: 1.5
          });
        },
        (error) => {
          console.error('Error obteniendo la ubicación:', error);
        }
      );
    }
  };
  
  return (
    <div className="relative h-full w-full">
      {/* Overlay de búsqueda */}
      <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-10">
        <div className="glass-panel flex items-center p-2 sm:p-3 rounded-xl">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Buscar ubicación..."
            className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="ml-2 text-primary"
              onClick={() => setSearchQuery("")}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
      
      {/* Contenedor del mapa */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 bg-muted"
      ></div>
      
      {/* Botón de ubicación actual */}
      <button 
        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-elevation-medium bg-white text-primary transition-transform hover:scale-105 active:scale-95 absolute bottom-28 right-2 sm:right-4"
        aria-label="Ubicación actual"
        onClick={goToUserLocation}
      >
        <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      
      {/* Botón de reportar incidente */}
      <button 
        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-elevation-medium bg-destructive text-destructive-foreground transition-transform hover:scale-105 active:scale-95 absolute bottom-28 left-2 sm:left-4"
        aria-label="Reportar incidente"
      >
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      
      {/* Panel de información de seguridad */}
      {safetyLevel && selectedMarker && (
        <div className="absolute bottom-20 left-2 right-2 sm:left-4 sm:right-4 glass-panel p-3 sm:p-4 rounded-xl animate-fade-in-up">
          <div className="flex items-start">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0",
              safetyLevel === 'safe' ? "bg-safety-safe text-white" : 
              safetyLevel === 'caution' ? "bg-safety-caution text-white" : 
              "bg-safety-danger text-white"
            )}>
              {safetyLevel === 'safe' ? (
                <Shield className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {selectedMarker.label}
                </h3>
                <button 
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
                  onClick={() => setSafetyLevel(null)}
                >
                  Cerrar
                </button>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {safetyLevel === 'safe' ? 
                  'Esta zona ha sido calificada como segura por los miembros de la comunidad con pocos reportes de incidentes.' : 
                safetyLevel === 'caution' ? 
                  'Proceder con precaución. Se han reportado algunos incidentes en esta zona.' : 
                  'Múltiples incidentes reportados. Considera rutas alternativas si es posible.'}
              </p>
              {safetyLevel !== 'safe' && (
                <div className="mt-3 flex items-center justify-between">
                  <button className="text-xs sm:text-sm text-primary font-medium">
                    Ver rutas seguras
                  </button>
                  <button className="text-xs sm:text-sm text-primary font-medium">
                    Alertar contactos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
