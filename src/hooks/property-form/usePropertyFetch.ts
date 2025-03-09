
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyFormData, PropertyImage, PropertyAgent, PropertyCity } from "@/types/property";
import { initialFormData } from "./initialFormData";

// Helper function to safely convert JSON or array to array
const safeParseArray = (value: any, defaultValue: any[] = []): any[] => {
  if (!value) return defaultValue;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
  return defaultValue;
};

// Helper function to safely convert agent data to PropertyAgent type
const formatAgentData = (agentData: any): PropertyAgent | undefined => {
  if (!agentData) return undefined;
  
  if (typeof agentData === 'string') {
    return {
      id: agentData,
      name: 'Unknown Agent',
    };
  }
  
  if (typeof agentData === 'object') {
    return {
      id: agentData.id || '',
      name: agentData.name || agentData.full_name || 'Unknown Agent',
      email: agentData.email,
      phone: agentData.phone,
      photoUrl: agentData.photoUrl || agentData.photo_url,
      address: agentData.address,
    };
  }
  
  return undefined;
};

export function usePropertyFetch(id: string | undefined) {
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    async function fetchProperty() {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Fetch the property from the database
        const { data: propertyData, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Fetch images from property_images table
        const { data: imageData, error: imageError } = await supabase
          .from('property_images')
          .select('*')
          .eq('property_id', id)
          .order('sort_order', { ascending: true });
          
        if (imageError) {
          console.error('Error fetching property images:', imageError);
        }
        
        const images: PropertyImage[] = imageData || [];
        
        // Filter images by type and flags
        const regularImages = images.filter(img => img.type === 'image' || !img.type);
        const floorplanImages = images.filter(img => img.type === 'floorplan');
        const featuredImage = regularImages.find(img => img.is_main)?.url || null;
        const featuredImages = regularImages
          .filter(img => img.is_featured_image)
          .map(img => img.url);
        
        if (propertyData) {
          // Parse JSON strings from the database to objects
          const features = safeParseArray(propertyData.features);
          const areas = safeParseArray(propertyData.areas);
          const nearby_places = safeParseArray(propertyData.nearby_places);
          
          // Handle nearby_cities with fallback for older database entries
          let nearby_cities: PropertyCity[] = [];
          
          try {
            // For older database entries that might not have the nearby_cities field
            // Using a try-catch as propertyData.nearby_cities might not exist in type definition
            if (propertyData.nearby_cities !== undefined) {
              nearby_cities = safeParseArray(propertyData.nearby_cities);
            }
          } catch (error) {
            console.warn('No nearby_cities property found, using empty array');
            nearby_cities = [];
          }
          
          // Process agent data for backward compatibility
          const agentId = propertyData.agent_id;
          let agentData: PropertyAgent | undefined;
          
          if (agentId) {
            agentData = {
              id: agentId,
              name: 'Unknown Agent'
            };
          }
          
          // Convert featuredImages to PropertyImages for coverImages
          const coverImages = featuredImages.map(url => ({
            id: `cover-${Date.now()}-${Math.random()}`,
            url
          }));
          
          // Set the form data with safe defaults for new fields
          setFormData({
            ...initialFormData,
            ...propertyData,
            features,
            areas,
            nearby_places,
            nearby_cities,
            hasGarden: propertyData.hasGarden || false,
            images: regularImages,
            floorplans: floorplanImages,
            featuredImage: featuredImage,
            featuredImages: featuredImages,
            agent: agentData,
            // Add backward compatibility fields
            coverImages, // Now as PropertyImage[]
            gridImages: regularImages.slice(0, 4), // Now as PropertyImage[]
            areaPhotos: []
          });
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProperty();
  }, [id]);
  
  return { formData, setFormData, isLoading };
}
