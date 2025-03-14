
import { useState } from "react";
import { Camera, MapPin, Clock, AlertTriangle, ChevronDown, X, Check, Upload, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportIncidentProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit?: (report: any) => void;
}

const ReportIncident = ({ isVisible, onClose, onSubmit }: ReportIncidentProps) => {
  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [incidentTime, setIncidentTime] = useState("now");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const incidentTypes = [
    { id: "theft", label: "Theft" },
    { id: "assault", label: "Assault" },
    { id: "harassment", label: "Harassment" },
    { id: "suspicious", label: "Suspicious Activity" },
    { id: "vandalism", label: "Vandalism" },
    { id: "other", label: "Other" }
  ];
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      if (onSubmit) {
        onSubmit({
          type: incidentType,
          description,
          time: incidentTime,
          location: "Current Location", // In a real app, we would get actual coordinates
        });
      }
      
      // Reset form after showing confirmation
      setTimeout(() => {
        setStep(1);
        setIncidentType("");
        setDescription("");
        setIncidentTime("now");
        setIsSubmitted(false);
        onClose();
      }, 3000);
    }, 2000);
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
                {step > 1 ? "Back" : "Cancel"}
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
                  <h2 className="text-xl font-semibold">Report an Incident</h2>
                  <p className="text-muted-foreground mt-1">
                    What type of incident would you like to report?
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
                  Next
                </button>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold">Incident Details</h2>
                  <p className="text-muted-foreground mt-1">
                    Provide more information about what happened.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Description</label>
                    <textarea
                      className="w-full p-3 mt-1 rounded-xl border border-input bg-background min-h-24"
                      placeholder="Describe what you saw or experienced..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground">When did this happen?</label>
                    <div className="relative mt-1">
                      <select
                        className="w-full appearance-none p-3 pr-10 rounded-xl border border-input bg-background"
                        value={incidentTime}
                        onChange={(e) => setIncidentTime(e.target.value)}
                      >
                        <option value="now">Just now</option>
                        <option value="today">Earlier today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="week">Within the past week</option>
                        <option value="month">Within the past month</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="text-muted-foreground w-5 h-5 mr-2" />
                    <div className="text-sm">
                      <span className="font-medium">Location:</span> Using your current location
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleNext}
                  className={cn(
                    "w-full py-3 rounded-xl font-medium transition-all duration-300",
                    "bg-primary text-primary-foreground",
                    !description && "opacity-50 pointer-events-none"
                  )}
                  disabled={!description}
                >
                  Next
                </button>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold">Add Evidence (Optional)</h2>
                  <p className="text-muted-foreground mt-1">
                    Upload photos or videos if available.
                  </p>
                </div>
                
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">Drag & drop files here</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse your device
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      multiple
                    />
                    <button className="mt-4 text-sm text-primary font-medium py-2 px-4 border border-primary/30 rounded-lg">
                      Choose Files
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex">
                  <Info className="text-blue-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Your report will help keep the community safe. All reports are kept anonymous unless you choose to share your information.
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
                    {isSubmitting ? "Submitting..." : "Submit Report"}
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
            <h3 className="text-lg font-medium">Report Submitted</h3>
            <p className="text-center text-muted-foreground max-w-xs">
              Thank you for your report. It will help keep the community safe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIncident;
