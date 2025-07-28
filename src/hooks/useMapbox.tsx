import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MapboxState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useMapbox = () => {
  const [state, setState] = useState<MapboxState>({
    token: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          throw error;
        }

        if (data?.token) {
          setState({
            token: data.token,
            loading: false,
            error: null
          });
        } else {
          throw new Error('No token received');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setState({
          token: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    };

    fetchMapboxToken();
  }, []);

  return state;
};