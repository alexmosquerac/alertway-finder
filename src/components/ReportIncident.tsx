
import { useState } from "react";
import { Camera, MapPin, Clock, AlertTriangle, ChevronDown, X, Check, Upload, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportIncidentProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit?: (report: any) => void;
}

const ReportIncident = ({ isVisible, onClose, onSubmit }: ReportIncidentProps) => {
  const { user } = useAuth();
  const { position, loading: locationLoading, error: locationError } = useGeolocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [incidentTime, setIncidentTime] = useState("now");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const incidentTypes = [
    { id: "theft", label: "Robo" },
    { id: "assault", label: "Agresión" },
    { id: "harassment", label: "Acoso" },
    { id: "suspicious", label: "Actividad sospechosa" },
    { id: "vandalism", label: "Vandalismo" },
    { id: "other", label: "Otro" }
  ];
  
  const handleSubmit = async () => {
    if (!user) {
      setStep(4); // Show auth step
      return;
    }

    if (!position) {
      toast({
        title: "Ubicación requerida",
        description: "No se pudo obtener tu ubicación actual",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calcular timestamp del incidente
      let incidentTimestamp = new Date();
      if (incidentTime === "today") {
        incidentTimestamp.setHours(incidentTimestamp.getHours() - 2);
      } else if (incidentTime === "yesterday") {
        incidentTimestamp.setDate(incidentTimestamp.getDate() - 1);
      } else if (incidentTime === "week") {
        incidentTimestamp.setDate(incidentTimestamp.getDate() - 3);
      } else if (incidentTime === "month") {
        incidentTimestamp.setDate(incidentTimestamp.getDate() - 10);
      }

      const { error } = await supabase
        .from('incident_reports')
        .insert({
          user_id: user.id,
          incident_type: incidentType,
          category: incidentType, // Map incident_type to category
          description,
          latitude: position.latitude,
          longitude: position.longitude,
          incident_time: incidentTimestamp.toISOString(),
          severity: 'medium',
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      
      if (onSubmit) {
        onSubmit({
          type: incidentType,
          description,
          time: incidentTime,
          location: `${position.latitude}, ${position.longitude}`,
        });
      }

      toast({
        title: "Reporte enviado",
        description: "Tu reporte ha sido enviado correctamente",
      });

      // Trigger heatmap recalculation
      supabase.functions.invoke('calculate-heatmap').catch(console.error);
      
      // Reset form after showing confirmation
      setTimeout(() => {
        setStep(1);
        setIncidentType("");
        setDescription("");
        setIncidentTime("now");
        setIsSubmitted(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error al enviar reporte",
        description: "No se pudo enviar el reporte. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleNext = () => {
    setStep(step + 1);
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-elevation-high p-6 mx-4 slide-up">
        {!isSubmitted ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={handleBack}
                className="text-muted-foreground"
              >
                {step > 1 ? "Atrás" : "Cancelar"}
              </button>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      step === s ? "bg-primary w-6" : 
                      step > s ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <button 
                onClick={onClose}
                className="text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold">Reportar un incidente</h2>
                  <p className="text-muted-foreground mt-1">
                    ¿Qué tipo de incidente quieres reportar?
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {incidentTypes.map((type) => (
                    <button
                      key={type.id}
                      className={cn(
                        "p-3 rounded-xl border transition-all duration-200",
                        incidentType === type.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-muted-foreground/50"
                      )}
                      onClick={() => setIncidentType(type.id)}
                    >
                      <div className="font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleNext}
                  className={cn(
                    "w-full py-3 rounded-xl font-medium transition-all duration-300",
                    "bg-primary text-primary-foreground",
                    !incidentType && "opacity-50 pointer-events-none"
                  )}
                  disabled={!incidentType}
                >
                  Siguiente
                </button>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold">Detalles del incidente</h2>
                  <p className="text-muted-foreground mt-1">
                    Proporciona más información sobre lo que pasó.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Descripción</label>
                    <textarea
                      className="w-full p-3 mt-1 rounded-xl border border-input bg-background min-h-24"
                      placeholder="Describe lo que viste o experimentaste..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground">¿Cuándo pasó esto?</label>
                    <div className="relative mt-1">
                      <select
                        className="w-full appearance-none p-3 pr-10 rounded-xl border border-input bg-background"
                        value={incidentTime}
                        onChange={(e) => setIncidentTime(e.target.value)}
                      >
                        <option value="now">Ahora mismo</option>
                        <option value="today">Hoy más temprano</option>
                        <option value="yesterday">Ayer</option>
                        <option value="week">En la última semana</option>
                        <option value="month">En el último mes</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="text-muted-foreground w-5 h-5 mr-2" />
                    <div className="text-sm">
                      <span className="font-medium">Ubicación:</span> 
                      {locationLoading ? " Obteniendo ubicación..." : 
                       locationError ? " Error obteniendo ubicación" :
                       position ? " Ubicación actual detectada" : " Sin ubicación"}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleNext}
                  className={cn(
                    "w-full py-3 rounded-xl font-medium transition-all duration-300",
                    "bg-primary text-primary-foreground",
                    (!description || !position) && "opacity-50 pointer-events-none"
                  )}
                  disabled={!description || !position}
                >
                  Siguiente
                </button>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold">Añadir evidencia (opcional)</h2>
                  <p className="text-muted-foreground mt-1">
                    Sube fotos o videos si están disponibles.
                  </p>
                </div>
                
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">Arrastra y suelta archivos aquí</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      o haz clic para explorar tu dispositivo
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      multiple
                    />
                    <button className="mt-4 text-sm text-primary font-medium py-2 px-4 border border-primary/30 rounded-lg">
                      Elegir archivos
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex">
                  <Info className="text-blue-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Tu reporte ayudará a mantener segura a la comunidad. Todos los reportes se mantienen anónimos a menos que elijas compartir tu información.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-medium transition-all duration-300",
                      "bg-primary text-primary-foreground",
                      isSubmitting && "opacity-70 pointer-events-none"
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar reporte"}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold">Autenticación requerida</h2>
                  <p className="text-muted-foreground mt-1">
                    Debes iniciar sesión para reportar incidentes
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tu cuenta ayuda a verificar reportes y mantener la comunidad segura
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => window.location.href = '/auth'}
                    className="w-full py-3 rounded-xl font-medium bg-primary text-primary-foreground"
                  >
                    Iniciar Sesión / Registrarse
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-medium border border-border"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium">Reporte enviado</h3>
            <p className="text-center text-muted-foreground max-w-xs">
              Gracias por tu reporte. Ayudará a mantener segura a la comunidad.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIncident;
