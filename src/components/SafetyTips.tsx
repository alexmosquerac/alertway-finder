
import { Shield, AlertTriangle, Navigation, Phone, Eye, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const SafetyTips = () => {
  const tipCategories = [
    {
      id: "general",
      title: "General Safety",
      icon: Shield,
      color: "text-safety-info",
      bg: "bg-safety-info/10",
      tips: [
        "Stay aware of your surroundings at all times",
        "Trust your instincts – if something feels wrong, it probably is",
        "Keep emergency contacts easily accessible",
        "Share your location with trusted friends when in unfamiliar areas",
        "Avoid displaying valuable items in public"
      ]
    },
    {
      id: "night",
      title: "Night Safety",
      icon: Eye,
      color: "text-safety-caution",
      bg: "bg-safety-caution/10",
      tips: [
        "Stick to well-lit and populated areas",
        "Use SafePath to plan routes before heading out",
        "Consider taking transportation instead of walking alone",
        "Let someone know your expected arrival time",
        "Keep headphone volume low to stay alert"
      ]
    },
    {
      id: "emergency",
      title: "Emergency Response",
      icon: Phone,
      color: "text-safety-danger",
      bg: "bg-safety-danger/10",
      tips: [
        "Call emergency services (911) immediately in dangerous situations",
        "Use the emergency alert feature to notify contacts",
        "Provide clear location information when reporting incidents",
        "Move to a safe location if possible",
        "Follow instructions from emergency responders"
      ]
    },
    {
      id: "travel",
      title: "Travel Safety",
      icon: Map,
      color: "text-safety-safe",
      bg: "bg-safety-safe/10",
      tips: [
        "Research areas before visiting unfamiliar locations",
        "Use the SafePath map to identify safer routes",
        "Keep digital copies of important documents",
        "Learn basic phrases if traveling to areas with different languages",
        "Register with local embassies when traveling internationally"
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
          <h3 className="font-medium">Remember</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          SafePath is designed to help you make informed decisions but cannot guarantee safety. Always use common sense and contact emergency services in dangerous situations.
        </p>
      </div>
    </div>
  );
};

export default SafetyTips;
