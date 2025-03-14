
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const MapboxToken = () => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("mapbox_token") || "";
  });
  const [isVisible, setIsVisible] = useState(!localStorage.getItem("mapbox_token"));

  const saveToken = () => {
    if (token.trim()) {
      localStorage.setItem("mapbox_token", token.trim());
      window.location.reload(); // Reload to initialize map with token
      toast({
        title: "Token saved",
        description: "Your Mapbox token has been saved.",
      });
      setIsVisible(false);
    } else {
      toast({
        title: "Invalid token",
        description: "Please enter a valid Mapbox token.",
        variant: "destructive",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-elevation-medium p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Mapbox Token Required</h2>
        <p className="text-muted-foreground mb-4">
          To use the map functionality, please enter your Mapbox public access token.
          You can get a token by signing up at{" "}
          <a 
            href="https://account.mapbox.com/auth/signup/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            mapbox.com
          </a>.
        </p>
        <div className="space-y-4">
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter Mapbox token..."
            className="w-full"
          />
          <div className="flex justify-end space-x-2">
            <Button onClick={saveToken} disabled={!token.trim()}>
              Save Token
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapboxToken;
