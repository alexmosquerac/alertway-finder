
import { Shield, AlertTriangle, Navigation, Phone, Eye, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const SafetyTips = () => {
  const tipCategories = [
    {
      id: "general",
      title: "Seguridad general",
      icon: Shield,
      color: "text-safety-info",
      bg: "bg-safety-info/10",
      tips: [
        "Mantente alerta de tu entorno en todo momento",
        "Confía en tus instintos: si algo se siente mal, probablemente lo esté",
        "Mantén los contactos de emergencia fácilmente accesibles",
        "Comparte tu ubicación con amigos de confianza en áreas desconocidas",
        "Evita mostrar objetos valiosos en público"
      ]
    },
    {
      id: "night",
      title: "Seguridad nocturna",
      icon: Eye,
      color: "text-safety-caution",
      bg: "bg-safety-caution/10",
      tips: [
        "Mantente en áreas bien iluminadas y pobladas",
        "Usa AlertWay para planificar rutas antes de salir",
        "Considera usar transporte en lugar de caminar solo",
        "Dile a alguien tu hora estimada de llegada",
        "Mantén el volumen de los auriculares bajo para estar alerta"
      ]
    },
    {
      id: "emergency",
      title: "Respuesta de emergencia",
      icon: Phone,
      color: "text-safety-danger",
      bg: "bg-safety-danger/10",
      tips: [
        "Llama a servicios de emergencia (112) inmediatamente en situaciones peligrosas",
        "Usa la función de alerta de emergencia para notificar a tus contactos",
        "Proporciona información clara de ubicación al reportar incidentes",
        "Muévete a un lugar seguro si es posible",
        "Sigue las instrucciones de los equipos de emergencia"
      ]
    },
    {
      id: "travel",
      title: "Seguridad en viajes",
      icon: Map,
      color: "text-safety-safe",
      bg: "bg-safety-safe/10",
      tips: [
        "Investiga las áreas antes de visitar ubicaciones desconocidas",
        "Usa el mapa de AlertWay para identificar rutas más seguras",
        "Mantén copias digitales de documentos importantes",
        "Aprende frases básicas si viajas a áreas con idiomas diferentes",
        "Regístrate en embajadas locales cuando viajes internacionalmente"
      ]
    }
  ];
  
  return (
    <div className="space-y-6">
      {tipCategories.map((category) => (
        <div 
          key={category.id} 
          className="border border-border rounded-xl overflow-hidden animate-fade-in"
        >
          <div className={cn("p-4 flex items-center", category.bg)}>
            <div className={cn("w-10 h-10 rounded-full bg-white/90 flex items-center justify-center mr-3")}>
              <category.icon className={cn("w-5 h-5", category.color)} />
            </div>
            <h3 className="font-medium">{category.title}</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {category.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5", category.bg)}>
                    <span className={cn("text-xs font-medium", category.color)}>{index + 1}</span>
                  </div>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      
      <div className="border border-border rounded-xl overflow-hidden p-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-safety-caution mr-2" />
          <h3 className="font-medium">Recuerda</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          AlertWay está diseñado para ayudarte a tomar decisiones informadas pero no puede garantizar la seguridad. Siempre usa el sentido común y contacta a servicios de emergencia en situaciones peligrosas.
        </p>
      </div>
    </div>
  );
};

export default SafetyTips;
