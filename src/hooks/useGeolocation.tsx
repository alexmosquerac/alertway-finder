import { useState, useEffect } from 'react';

interface Position {
  latitude: number;
  longitude: number;
}

interface LocationState {
  position: Position | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>({
    position: null,
    loading: true,
    error: null
  });

  const getCurrentPosition = (): Promise<Position> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        // Si no hay geolocalización, usar Barcelona como ubicación por defecto
        console.log('Geolocation not available, using Barcelona as fallback');
        resolve({
          latitude: 41.3909,
          longitude: 2.1320
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Real geolocation detected:', position.coords.latitude, position.coords.longitude);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error, using Barcelona as fallback:', error.message);
          // En caso de error, usar Barcelona como fallback
          resolve({
            latitude: 41.3909,
            longitude: 2.1320
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Reducir timeout para fallback más rápido
          maximumAge: 60000 // Aumentar cache para evitar consultas repetidas
        }
      );
    });
  };

  useEffect(() => {
    getCurrentPosition()
      .then((position) => {
        setLocation({
          position,
          loading: false,
          error: null
        });
      })
      .catch((error) => {
        // Esto ya no debería suceder, pero por seguridad
        setLocation({
          position: {
            latitude: 41.3909,
            longitude: 2.1320
          },
          loading: false,
          error: error.message
        });
      });
  }, []);

  return {
    ...location,
    getCurrentPosition
  };
};