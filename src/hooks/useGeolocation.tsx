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
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no está soportada por este navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          let message = 'Error desconocido obteniendo ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permiso de ubicación denegado';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Ubicación no disponible';
              break;
            case error.TIMEOUT:
              message = 'Tiempo de espera agotado para obtener ubicación';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
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
        setLocation({
          position: null,
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