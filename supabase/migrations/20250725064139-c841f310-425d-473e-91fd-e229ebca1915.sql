-- Corregir funciones con search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;