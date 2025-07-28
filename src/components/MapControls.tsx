import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation } from 'lucide-react';

interface MapControlsProps {
  onLocationClick: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onLocationClick }) => {
  return (
    <>
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Input
          type="text"
          placeholder="Buscar ubicación..."
          className="bg-background/90 backdrop-blur-sm border-border/50"
        />
      </div>

      {/* Location Button */}
      <Button
        onClick={onLocationClick}
        className="absolute bottom-20 right-4 z-10 rounded-full w-12 h-12 p-0"
        variant="secondary"
      >
        <Navigation className="w-5 h-5" />
      </Button>
    </>
  );
};

export default MapControls;