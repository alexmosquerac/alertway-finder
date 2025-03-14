import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Bell, Shield, Map, User, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    location: true,
    safetyAlerts: true,
    incidentAlerts: true,
    darkMode: false,
    dataSharing: false
  });
  
  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const settingSections = [
    {
      id: "account",
      title: "Account",
      icon: User,
      color: "bg-primary/10 text-primary",
      items: [
        { id: "profile", label: "Your Profile", action: "navigate" },
        { id: "privacy", label: "Privacy Settings", action: "navigate" },
        { id: "security", label: "Security", action: "navigate" }
      ]
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      color: "bg-amber-100 text-amber-600",
      items: [
        { 
          id: "notifications", 
          label: "Enable Notifications", 
          action: "toggle",
          value: settings.notifications
        },
        { 
          id: "safetyAlerts", 
          label: "Safety Alerts", 
          action: "toggle",
          value: settings.safetyAlerts,
          disabled: !settings.notifications
        },
        { 
          id: "incidentAlerts", 
          label: "Incident Reports", 
          action: "toggle",
          value: settings.incidentAlerts,
          disabled: !settings.notifications
        }
      ]
    },
    {
      id: "privacy",
      title: "Privacy & Data",
      icon: Lock,
      color: "bg-purple-100 text-purple-600",
      items: [
        { 
          id: "location", 
          label: "Location Services", 
          action: "toggle",
          value: settings.location
        },
        { 
          id: "dataSharing", 
          label: "Anonymous Data Sharing", 
          action: "toggle",
          value: settings.dataSharing
        },
        { 
          id: "dataDeletion", 
          label: "Delete My Data", 
          action: "navigate",
          danger: true
        }
      ]
    },
    {
      id: "appearance",
      title: "Appearance",
      icon: Map,
      color: "bg-green-100 text-green-600",
      items: [
        { 
          id: "darkMode", 
          label: "Dark Mode", 
          action: "toggle",
          value: settings.darkMode
        },
        { id: "mapStyle", label: "Map Style", action: "navigate" }
      ]
    },
    {
      id: "about",
      title: "About",
      icon: Shield,
      color: "bg-blue-100 text-blue-600",
      items: [
        { id: "help", label: "Help & Support", action: "navigate" },
        { id: "privacy", label: "Privacy Policy", action: "navigate" },
        { id: "terms", label: "Terms of Service", action: "navigate" },
        { id: "about", label: "About SafePath", action: "navigate" }
      ]
    }
  ];
  
  return (
    <MainLayout>
      <div className="p-4 h-full flex flex-col">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        
        <div className="flex-1 overflow-auto">
          <div className="space-y-6">
            {settingSections.map((section) => (
              <div key={section.id} className="animate-fade-in">
                <div className="flex items-center mb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mr-2", section.color)}>
                    <section.icon className="w-4 h-4" />
                  </div>
                  <h2 className="font-medium">{section.title}</h2>
                </div>
                
                <div className="bg-white rounded-xl overflow-hidden border border-border shadow-elevation-low">
                  {section.items.map((item, index) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "p-4 flex items-center justify-between",
                        index !== section.items.length - 1 && "border-b border-border",
                        item.disabled && "opacity-50"
                      )}
                    >
                      <span className={cn(
                        "font-medium",
                        item.danger && "text-destructive"
                      )}>
                        {item.label}
                      </span>
                      
                      {item.action === "toggle" ? (
                        <button
                          onClick={() => !item.disabled && toggleSetting(item.id as keyof typeof settings)}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-colors duration-200",
                            item.value ? "bg-primary" : "bg-muted",
                            item.disabled && "cursor-not-allowed"
                          )}
                          disabled={item.disabled}
                        >
                          <span 
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                              item.value ? "left-7" : "left-1"
                            )}
                          />
                        </button>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="py-6 text-center text-xs text-muted-foreground">
              <p>SafePath Version 1.0.0</p>
              <p className="mt-1">© 2023 SafePath Technologies Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
