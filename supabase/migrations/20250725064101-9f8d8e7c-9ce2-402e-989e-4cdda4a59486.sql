-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  verified_reports INTEGER DEFAULT 0,
  total_reports INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Los usuarios pueden ver todos los perfiles públicos" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear su propio perfil" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Crear tabla de reportes de incidentes
CREATE TABLE public.incident_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  incident_type TEXT NOT NULL,
  title TEXT,
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  incident_time TIMESTAMP WITH TIME ZONE NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_count INTEGER DEFAULT 0,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en incident_reports
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para incident_reports
CREATE POLICY "Todos pueden ver reportes verificados" 
ON public.incident_reports 
FOR SELECT 
USING (is_verified = TRUE OR auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear reportes" 
ON public.incident_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios reportes" 
ON public.incident_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Crear tabla de verificaciones de reportes
CREATE TABLE public.report_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.incident_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  is_accurate BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(report_id, user_id)
);

-- Habilitar RLS en report_verifications
ALTER TABLE public.report_verifications ENABLE ROW LEVEL SECURITY;

-- Políticas para report_verifications
CREATE POLICY "Los usuarios pueden crear verificaciones" 
ON public.report_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden ver sus verificaciones" 
ON public.report_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Crear función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incident_reports_updated_at
  BEFORE UPDATE ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil automáticamente cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar estadísticas de gamificación
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estadísticas cuando se verifica un reporte
  IF TG_OP = 'UPDATE' AND OLD.is_verified = FALSE AND NEW.is_verified = TRUE THEN
    UPDATE public.profiles 
    SET 
      verified_reports = verified_reports + 1,
      points = points + 10
    WHERE user_id = NEW.user_id;
    
    -- Actualizar nivel basado en puntos
    UPDATE public.profiles 
    SET level = CASE 
      WHEN points >= 500 THEN 5
      WHEN points >= 200 THEN 4
      WHEN points >= 100 THEN 3
      WHEN points >= 50 THEN 2
      ELSE 1
    END
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- Actualizar total de reportes cuando se crea uno nuevo
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET 
      total_reports = total_reports + 1,
      points = points + 5
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT OR UPDATE ON public.incident_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();