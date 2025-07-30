-- Actualizar política RLS para permitir que todos vean los reportes de incidentes
-- Esto es necesario para que aparezcan en el mapa público
DROP POLICY IF EXISTS "Todos pueden ver reportes verificados" ON public.incident_reports;

CREATE POLICY "Todos pueden ver reportes de incidentes" 
ON public.incident_reports 
FOR SELECT 
USING (true);

-- Actualizar también para que usuarios autenticados puedan ver sus propios reportes no verificados
CREATE POLICY "Usuarios pueden ver sus propios reportes" 
ON public.incident_reports 
FOR SELECT 
USING (auth.uid() = user_id);