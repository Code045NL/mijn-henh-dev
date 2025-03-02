
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { PropertyFloorplan } from "@/types/property";

interface FloorplansCardProps {
  floorplans: PropertyFloorplan[] | string[];
  floorplanEmbedScript?: string;
  onFloorplanUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFloorplan?: (index: number) => void;
  onUpdateFloorplanEmbedScript?: (script: string) => void;
}

export function FloorplansCard({
  floorplans = [],
  floorplanEmbedScript = "",
  onFloorplanUpload,
  onRemoveFloorplan,
  onUpdateFloorplanEmbedScript,
}: FloorplansCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localFloorplans, setLocalFloorplans] = useState<(PropertyFloorplan | string)[]>([]);
  
  // Use a key to force re-render when floorplans array changes
  const [floorplansKey, setFloorplansKey] = useState(Date.now());
  
  useEffect(() => {
    console.log("FloorplansCard - floorplans prop updated:", floorplans);
    // Create a new array copy to ensure React detects the change
    setLocalFloorplans(Array.isArray(floorplans) ? [...floorplans] : []);
    setFloorplansKey(Date.now()); // Update key to force re-render
  }, [floorplans]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFloorplanUpload) {
      setIsLoading(true);
      try {
        onFloorplanUpload(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEmbedScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onUpdateFloorplanEmbedScript) {
      onUpdateFloorplanEmbedScript(e.target.value);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent, index: number) => {
    // Explicitly prevent default behavior to avoid any URL navigation
    e.preventDefault();
    e.stopPropagation();
    
    if (onRemoveFloorplan) {
      onRemoveFloorplan(index);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Floorplans</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault(); // Prevent any default navigation
              document.getElementById('floorplan-upload')?.click();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Floorplans
          </Button>
          <input
            id="floorplan-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="floorplan-embed">Floorplan Embed Script</Label>
          <Textarea
            id="floorplan-embed"
            placeholder="Paste your 3D/virtual floorplan embed script here..."
            className="min-h-[100px] font-mono text-xs"
            value={floorplanEmbedScript}
            onChange={handleEmbedScriptChange}
          />
          <p className="text-xs text-muted-foreground">
            Paste embed code from Matterport, iGuide, or other 3D tour providers
          </p>
        </div>

        {localFloorplans.length > 0 && (
          <div key={floorplansKey} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {localFloorplans.map((floorplan, index) => {
              const url = typeof floorplan === 'string' ? floorplan : floorplan.url;
              const id = typeof floorplan === 'string' ? `floorplan-string-${index}` : floorplan.id || `floorplan-object-${index}`;
              
              return (
                <div key={`${id}-${floorplansKey}`} className="relative group">
                  <img
                    src={url}
                    alt={`Floorplan ${index + 1}`}
                    className="w-full h-auto max-h-[200px] object-contain border rounded-md bg-slate-50"
                  />
                  {onRemoveFloorplan && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleRemoveClick(e, index)}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
