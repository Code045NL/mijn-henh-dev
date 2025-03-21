
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PropertyFormData } from "@/types/property";
import { prepareAreasForFormSubmission, preparePropertiesForJsonField } from "./property-form/preparePropertyData";

export function usePropertyAutoSave() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const autosaveData = async (formData: PropertyFormData): Promise<boolean> => {
    if (!formData.id) return false;
    
    try {
      setIsSaving(true);
      
      const submitData = {
        title: formData.title,
        price: formData.price,
        address: formData.address,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        sqft: formData.sqft,
        livingArea: formData.livingArea,
        buildYear: formData.buildYear,
        garages: formData.garages,
        energyLabel: formData.energyLabel,
        hasGarden: formData.hasGarden,
        description: formData.description,
        shortDescription: formData.shortDescription,
        location_description: formData.location_description,
        features: JSON.stringify(formData.features),
        latitude: formData.latitude,
        longitude: formData.longitude,
        object_id: formData.object_id,
        agent_id: formData.agent_id,
        template_id: formData.template_id,
        virtualTourUrl: formData.virtualTourUrl,
        youtubeUrl: formData.youtubeUrl,
        floorplanEmbedScript: formData.floorplanEmbedScript,
      };
      
      console.log('Auto-saving property data...', formData);

      const { error } = await supabase
        .from('properties')
        .update(submitData)
        .eq('id', formData.id);

      if (error) {
        console.error('Auto-save error:', error);
        throw error;
      }

      if (formData.floorplans && formData.floorplans.length > 0) {
        try {
          const { data: existingFloorplans } = await supabase
            .from('property_images')
            .select('id, url')
            .eq('property_id', formData.id)
            .eq('type', 'floorplan');
            
          const existingUrls = existingFloorplans?.map(f => f.url) || [];
          
          for (const floorplan of formData.floorplans) {
            const floorplanUrl = typeof floorplan === 'string' ? floorplan : floorplan.url;
            if (!floorplanUrl || existingUrls.includes(floorplanUrl)) continue;
            
            await supabase
              .from('property_images')
              .insert({
                property_id: formData.id,
                url: floorplanUrl,
                type: 'floorplan'
              });
          }
        } catch (error) {
          console.error('Error updating floorplans:', error);
        }
      }

      setLastSaved(new Date());
      setPendingChanges(false);
      console.log('Auto-save successful');
      return true;
    } catch (error: any) {
      console.error('Auto-save failed:', error);
      toast({
        title: "Auto-save Failed",
        description: error.message || "An error occurred during auto-save",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    autosaveData,
    isSaving,
    lastSaved,
    pendingChanges,
    setPendingChanges,
    setLastSaved
  };
}
