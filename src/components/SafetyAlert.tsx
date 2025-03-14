
import { useState } from "react";
import { Phone, AlertTriangle, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafetyAlertProps {
  isVisible: boolean;
  onClose: () => void;
}

const SafetyAlert = ({ isVisible, onClose }: SafetyAlertProps) => {
  const [isSending, setSending] = useState(false);
  const [isSent, setSent] = useState(false);
  
  const handleSendAlert = () => {
    setSending(true);
    // Simulate sending the alert
    setTimeout(() => {
      setSending(false);
      setSent(true);
      
      // Reset after showing confirmation
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 3000);
    }, 2000);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-elevation-high p-6 mx-4 slide-up">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mr-3">
              <AlertTriangle className="text-destructive w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold">Send Emergency Alert</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {!isSent ? (
          <>
            <p className="mt-4 text-muted-foreground">
              This will send an alert with your current location to your emergency contacts.
            </p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center p-3 border border-border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Phone className="text-primary w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-sm text-muted-foreground">Primary Contact</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 border border-border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Phone className="text-primary w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">Jane Smith</div>
                  <div className="text-sm text-muted-foreground">Secondary Contact</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleSendAlert}
                className={cn(
                  "w-full py-3 rounded-xl font-medium transition-all duration-300",
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                  isSending && "opacity-70 pointer-events-none"
                )}
                disabled={isSending}
              >
                {isSending ? (
                  <span className="flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 mr-2 animate-pulse" />
                    Sending Alert...
                  </span>
                ) : (
                  "Send Emergency Alert"
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium">Alert Sent Successfully</h3>
            <p className="text-center text-muted-foreground">
              Your emergency contacts have been notified of your location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyAlert;
