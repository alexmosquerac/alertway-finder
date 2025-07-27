-- Agregar campos necesarios para el sistema de zonas críticas
ALTER TABLE public.incident_reports 
ADD COLUMN category TEXT NOT NULL DEFAULT 'other',
ADD COLUMN confirmations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN weight DECIMAL DEFAULT 1.0;

-- Crear tabla para datos del heatmap precalculados
CREATE TABLE public.heatmap_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grid_lat DECIMAL NOT NULL,
  grid_lng DECIMAL NOT NULL,
  risk_score DECIMAL NOT NULL DEFAULT 0,
  incident_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(grid_lat, grid_lng)
);

-- Habilitar RLS en heatmap_data
ALTER TABLE public.heatmap_data ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan leer los datos del heatmap
CREATE POLICY "Todos pueden ver datos del heatmap" 
ON public.heatmap_data 
FOR SELECT 
USING (true);

-- Función para calcular el peso de un incidente basado en categoría
CREATE OR REPLACE FUNCTION public.get_incident_weight(category TEXT)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE category
    WHEN 'theft' THEN 1.0
    WHEN 'assault' THEN 1.0
    WHEN 'harassment' THEN 0.8
    WHEN 'suspicious' THEN 0.6
    WHEN 'accident' THEN 0.7
    WHEN 'crowding' THEN 0.3
    WHEN 'vandalism' THEN 0.5
    ELSE 0.4
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para calcular el factor de decaimiento temporal
CREATE OR REPLACE FUNCTION public.get_time_decay_factor(incident_time TIMESTAMP WITH TIME ZONE)
RETURNS DECIMAL AS $$
DECLARE
  hours_passed DECIMAL;
BEGIN
  hours_passed := EXTRACT(EPOCH FROM (now() - incident_time)) / 3600.0;
  -- Decaimiento exponencial: 50% cada 0.5 horas (30 minutos)
  RETURN POWER(0.5, hours_passed / 0.5);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para calcular datos del heatmap
CREATE OR REPLACE FUNCTION public.calculate_heatmap_data()
RETURNS void AS $$
DECLARE
  grid_size DECIMAL := 0.001; -- Aproximadamente 100m por celda
  min_lat DECIMAL;
  max_lat DECIMAL;
  min_lng DECIMAL; 
  max_lng DECIMAL;
  current_lat DECIMAL;
  current_lng DECIMAL;
  risk_score DECIMAL;
  incident_count INTEGER;
BEGIN
  -- Limpiar datos anteriores
  TRUNCATE public.heatmap_data;
  
  -- Obtener límites del área de trabajo (últimas 2 horas de incidentes)
  SELECT 
    COALESCE(MIN(latitude), 0) - grid_size,
    COALESCE(MAX(latitude), 0) + grid_size,
    COALESCE(MIN(longitude), 0) - grid_size,
    COALESCE(MAX(longitude), 0) + grid_size
  INTO min_lat, max_lat, min_lng, max_lng
  FROM public.incident_reports 
  WHERE incident_time > now() - INTERVAL '2 hours';
  
  -- Iterar sobre la cuadrícula
  current_lat := min_lat;
  WHILE current_lat <= max_lat LOOP
    current_lng := min_lng;
    WHILE current_lng <= max_lng LOOP
      -- Calcular puntuación de riesgo para esta celda
      SELECT 
        COALESCE(SUM(
          public.get_incident_weight(category) * 
          (1 + (jsonb_array_length(confirmations) * 0.25)) * 
          public.get_time_decay_factor(incident_time)
        ), 0),
        COUNT(*)
      INTO risk_score, incident_count
      FROM public.incident_reports 
      WHERE incident_time > now() - INTERVAL '2 hours'
        AND latitude BETWEEN current_lat AND current_lat + grid_size
        AND longitude BETWEEN current_lng AND current_lng + grid_size
        AND is_verified = true;
      
      -- Solo insertar si hay actividad
      IF risk_score > 0 THEN
        INSERT INTO public.heatmap_data (grid_lat, grid_lng, risk_score, incident_count)
        VALUES (current_lat + grid_size/2, current_lng + grid_size/2, risk_score, incident_count);
      END IF;
      
      current_lng := current_lng + grid_size;
    END LOOP;
    current_lat := current_lat + grid_size;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear índices para mejor rendimiento
CREATE INDEX idx_incident_reports_location_time ON public.incident_reports(latitude, longitude, incident_time);
CREATE INDEX idx_incident_reports_category ON public.incident_reports(category);
CREATE INDEX idx_heatmap_data_location ON public.heatmap_data(grid_lat, grid_lng);