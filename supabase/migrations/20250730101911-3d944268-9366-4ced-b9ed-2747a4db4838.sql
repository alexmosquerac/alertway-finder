-- Habilitar realtime para la tabla incident_reports
ALTER TABLE public.incident_reports REPLICA IDENTITY FULL;

-- Activar publicación de cambios en tiempo real
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE incident_reports, heatmap_data;