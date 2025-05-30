
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PropertyFormData } from '@/types/property';

export function useLocationDescription(
  formData: PropertyFormData,
  onFieldChange: (field: keyof PropertyFormData, value: any) => void,
  setIsLoading: (loading: boolean) => void,
  toast: any
) {
  const generateLocationDescription = useCallback(async () => {
    if (!formData.address) {
      toast({
        title: "Error",
        description: "Please enter an address first",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-location-description', {
        body: { 
          address: formData.address,
          nearbyPlaces: formData.nearby_places || [],
          description: formData.description,
          language: 'nl',
          maxLength: 1000
        }
      });
      
      if (error) throw error;
      
      if (data && data.description) {
        console.log("Generated description:", data.description);
        onFieldChange('location_description', data.description);
        
        // Also save to database if we have a property ID
        if (formData.id) {
          const { error: updateError } = await supabase
            .from('properties')
            .update({ location_description: data.description })
            .eq('id', formData.id);
            
          if (updateError) throw updateError;
        }
        
        toast({
          title: "Success",
          description: "Location description generated successfully",
        });
      }
    } catch (error) {
      console.error("Error generating location description:", error);
      toast({
        title: "Error",
        description: "Failed to generate location description",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData.address, formData.id, formData.nearby_places, formData.description, onFieldChange, setIsLoading, toast]);
  
  return { generateLocationDescription };
}
