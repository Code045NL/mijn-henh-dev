
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import type { PropertyFormData, PropertySubmitData } from "@/types/property";
import { usePropertyValidation } from "./property-form/usePropertyValidation";
import { usePropertyDatabase } from "./property-form/usePropertyDatabase";
import { supabase } from "@/integrations/supabase/client"; 
import { 
  prepareAreasForFormSubmission, 
  preparePropertiesForJsonField
} from "./property-form/preparePropertyData";

export function usePropertyFormSubmit() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { validatePropertyData } = usePropertyValidation();
  const { updateProperty, createProperty } = usePropertyDatabase();

  const handleSubmit = async (e: React.FormEvent, formData: PropertyFormData, shouldRedirect = false) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    console.log("usePropertyFormSubmit - handleSubmit called with formData:", formData);
    
    if (!formData.id) {
      if (!validatePropertyData(formData)) {
        return false;
      }
    }
    
    try {
      const areasForSubmission = prepareAreasForFormSubmission(formData.areas);
      const featuresJson = preparePropertiesForJsonField(formData.features);
      const nearby_placesJson = preparePropertiesForJsonField(formData.nearby_places || []);
      const technicalItemsJson = formData.technicalItems ? preparePropertiesForJsonField(formData.technicalItems) : null;
      
      console.log("usePropertyFormSubmit - Form submission - areas:", areasForSubmission);
      console.log("usePropertyFormSubmit - Form submission - features:", featuresJson);
      console.log("usePropertyFormSubmit - Form submission - technicalItems:", technicalItemsJson);
      
      const submitData: PropertySubmitData = {
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
        location_description: formData.location_description,
        features: featuresJson,
        // Include these fields to satisfy TypeScript, but they'll be removed before database operations
        featuredImage: formData.featuredImage,
        featuredImages: formData.featuredImages || [],
        map_image: formData.map_image,
        latitude: formData.latitude,
        longitude: formData.longitude,
        areas: areasForSubmission,
        nearby_places: nearby_placesJson,
        images: formData.images.map(img => typeof img === 'string' ? img : img.url),
        object_id: formData.object_id,
        agent_id: formData.agent_id,
        template_id: formData.template_id,
        virtualTourUrl: formData.virtualTourUrl,
        youtubeUrl: formData.youtubeUrl,
        notes: formData.notes,
        technicalItems: technicalItemsJson,
        floorplanEmbedScript: formData.floorplanEmbedScript
      };
      
      console.log("usePropertyFormSubmit - Final submit data:", submitData);
      
      let success = false;
      if (formData.id) {
        success = await updateProperty(formData.id, submitData);
        
        if (success) {
          try {
            await supabase
              .from('property_images')
              .update({ is_main: false, is_featured_image: false })
              .eq('property_id', formData.id);
            
            if (formData.featuredImage) {
              console.log("Setting main image in database:", formData.featuredImage);
              const { error } = await supabase
                .from('property_images')
                .update({ is_main: true })
                .eq('property_id', formData.id)
                .eq('url', formData.featuredImage);
                
              if (error) {
                console.error("Error setting main image:", error);
              }
            }
            
            if (formData.featuredImages && formData.featuredImages.length > 0) {
              for (const imageUrl of formData.featuredImages) {
                console.log("Setting featured image in database:", imageUrl);
                const { error } = await supabase
                  .from('property_images')
                  .update({ is_featured_image: true })
                  .eq('property_id', formData.id)
                  .eq('url', imageUrl);
                  
                if (error) {
                  console.error("Error setting featured image:", error);
                }
              }
            }
            
            // Handle floorplans separately
            if (formData.floorplans && formData.floorplans.length > 0) {
              // First, get existing floorplans
              const { data: existingFloorplans } = await supabase
                .from('property_images')
                .select('id, url')
                .eq('property_id', formData.id)
                .eq('type', 'floorplan');
                
              const existingUrls = existingFloorplans?.map(f => f.url) || [];
              
              // Add new floorplans
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
            }
          } catch (error) {
            console.error("Error updating image flags:", error);
            // Don't consider this a failure of the overall save
          }
        }
      } else {
        success = await createProperty(submitData);
        
        if (success) {
          const { data: newProperty } = await supabase
            .from('properties')
            .select('id')
            .eq('title', formData.title)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (newProperty && newProperty.id) {
            try {
              // Add regular images to property_images table
              for (const image of formData.images) {
                const imageUrl = typeof image === 'string' ? image : image.url;
                await supabase
                  .from('property_images')
                  .insert({
                    property_id: newProperty.id,
                    url: imageUrl,
                    is_main: formData.featuredImage === imageUrl,
                    is_featured_image: formData.featuredImages?.includes(imageUrl) || false,
                    type: 'image'
                  });
              }
              
              // Add floorplans to property_images table
              if (formData.floorplans && formData.floorplans.length > 0) {
                for (const floorplan of formData.floorplans) {
                  const floorplanUrl = typeof floorplan === 'string' ? floorplan : floorplan.url;
                  if (!floorplanUrl) continue;
                  
                  await supabase
                    .from('property_images')
                    .insert({
                      property_id: newProperty.id,
                      url: floorplanUrl,
                      type: 'floorplan'
                    });
                }
              }
            } catch (error) {
              console.error("Error adding images to property_images table:", error);
              // Don't consider this a failure of the overall save
            }
          }
        }
        
        if (success && shouldRedirect) {
          navigate('/');
        }
      }
      
      console.log("usePropertyFormSubmit - Submission result:", success ? "Success" : "Failed");
      return success;
    } catch (error) {
      console.error("Error during property submit:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your request",
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleSubmit };
}
