import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PropertyFormData, PropertyNearbyPlace } from "@/types/property";
import { preparePropertiesForJsonField } from "@/hooks/property-form/preparePropertyData";

const categoryConfig = {
  "Food & Drinks": ["restaurant", "bar", "cafe"],
  "Nightlife & Entertainment": ["casino", "concert_hall", "event_venue", "night_club", "movie_theater"],
  "Education": ["school", "university", "library", "preschool", "primary_school", "secondary_school"],
  "Sports": ["gym", "arena", "fitness_center", "golf_course", "ski_resort", "sports_club", "sports_complex", "stadium", "swimming_pool"],
  "Shopping": ["supermarket", "shopping_mall"]
};

export function useNearbyPlaces(
  formData: PropertyFormData,
  onFieldChange: (field: keyof PropertyFormData, value: unknown) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<PropertyNearbyPlace[]>([]);
  const { toast } = useToast();

  const fetchPlaces = useCallback(async (categoryName: string): Promise<unknown> => {
    if (!formData.latitude || !formData.longitude) {
      toast({
        title: "Error",
        description: "Property coordinates are required to fetch nearby places",
        variant: "destructive"
      });
      return null;
    }
    
    if (!formData.id) {
      toast({
        title: "Error",
        description: "Property ID is required to fetch nearby places. Please save the property first.",
        variant: "destructive"
      });
      return null;
    }
    
    console.log(`useNearbyPlaces: Fetching nearby places for category: ${categoryName}`);
    console.log(`useNearbyPlaces: Coordinates: ${formData.latitude}, ${formData.longitude}`);
    console.log(`useNearbyPlaces: Property ID: ${formData.id}`);
    
    setIsLoading(true);
    
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('agency_settings')
        .select('google_maps_api_key')
        .single();
      
      if (settingsError) {
        console.error("useNearbyPlaces: Error fetching API key from settings:", settingsError);
        throw new Error("Could not fetch Google Maps API key from settings");
      }
      
      const apiKey = settingsData?.google_maps_api_key;
      console.log("useNearbyPlaces: Using API key from settings:", apiKey ? "API key found" : "No API key found");
      
      if (!apiKey) {
        console.error("useNearbyPlaces: No Google Maps API key found in settings");
        toast({
          title: "Missing API Key",
          description: "Please set a Google Maps API key in your agency settings",
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }
      
      const types = categoryConfig[categoryName as keyof typeof categoryConfig];
      
      if (!types || types.length === 0) {
        console.log(`useNearbyPlaces: No types found for category ${categoryName}, using it as a direct type`);
        const includedTypes = [categoryName];
        
        const requestBody = {
          includedTypes: [categoryName],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: {
                latitude: formData.latitude,
                longitude: formData.longitude
              },
              radius: 5000
            }
          }
        };
        
        console.log("useNearbyPlaces: Places API request body:", JSON.stringify(requestBody));
        
        const placesApiUrl = 'https://places.googleapis.com/v1/places:searchNearby';
        
        console.log("useNearbyPlaces: Calling Google Places API for direct type");
        
        const response = await fetch(placesApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`useNearbyPlaces: Places API returned status ${response.status}`, errorText);
          throw new Error(`Places API returned error: ${errorText}`);
        }
        
        const placesData = await response.json();
        
        console.log("useNearbyPlaces: Places API raw response:", placesData);
        
        if (!placesData.places || !Array.isArray(placesData.places)) {
          console.log("useNearbyPlaces: No results found from Places API");
          toast({
            title: "No places found",
            description: `No ${categoryName} places found near this location.`,
            variant: "default"
          });
          setIsLoading(false);
          return null;
        }
        
        const transformedPlaces = placesData.places.map((place: { id: string; displayName?: { text: string }; name?: string; formattedAddress?: string; rating?: number; userRatingCount?: number; types?: string[]; location?: { latitude: number; longitude: number } }) => ({
          id: place.id,
          name: place.displayName?.text || place.name || "Unknown place",
          vicinity: place.formattedAddress || "",
          rating: place.rating || null,
          user_ratings_total: place.userRatingCount || 0,
          type: categoryName,
          types: place.types || [],
          visible_in_webview: true,
          distance: null,
          latitude: place.location?.latitude || null,
          longitude: place.location?.longitude || null,
          category: categoryName
        }));
        
        console.log(`useNearbyPlaces: Found ${transformedPlaces.length} places for single type ${categoryName}`);
        
        setSearchResults(transformedPlaces);
        
        const result = { [categoryName]: transformedPlaces };
        setIsLoading(false);
        return result;
      } else {
        console.log(`useNearbyPlaces: Using category ${categoryName} with types:`, types);
    
        const allResults: PropertyNearbyPlace[] = [];
    
        for (const type of types) {
          const requestBody = {
            includedTypes: [type],
            maxResultCount: 10,
            locationRestriction: {
              circle: {
                center: {
                  latitude: formData.latitude,
                  longitude: formData.longitude
                },
                radius: 5000
              }
            }
          };
    
          console.log(`useNearbyPlaces: Places API request body for type ${type}:`, JSON.stringify(requestBody));
    
          const placesApiUrl = 'https://places.googleapis.com/v1/places:searchNearby';
    
          console.log(`useNearbyPlaces: Calling Google Places API for type ${type}`);
    
          const response = await fetch(placesApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location'
            },
            body: JSON.stringify(requestBody)
          });
    
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`useNearbyPlaces: Places API returned status ${response.status}`, errorText);
            throw new Error(`Places API returned error: ${errorText}`);
          }
    
          const placesData = await response.json();
    
          console.log(`useNearbyPlaces: Places API raw response for type ${type}:`, placesData);
    
          if (placesData.places && Array.isArray(placesData.places)) {
            const transformedPlaces = placesData.places.map((place: { id: string; displayName?: { text: string }; name?: string; formattedAddress?: string; rating?: number; userRatingCount?: number; types?: string[]; location?: { latitude: number; longitude: number } }) => ({
              id: place.id,
              name: place.displayName?.text || place.name || "Unknown place",
              vicinity: place.formattedAddress || "",
              rating: place.rating || null,
              user_ratings_total: place.userRatingCount || 0,
              type: type,
              types: place.types || [],
              visible_in_webview: true,
              distance: null,
              latitude: place.location?.latitude || null,
              longitude: place.location?.longitude || null,
              category: categoryName
            }));
    
            allResults.push(...transformedPlaces);
          }
        }
    
        console.log(`useNearbyPlaces: Found ${allResults.length} places for category ${categoryName}`);
    
        setSearchResults(allResults);
    
        const groupedResults = allResults.reduce((acc, place) => {
          if (!acc[place.type]) {
            acc[place.type] = [];
          }
          acc[place.type].push(place);
          return acc;
        }, {} as Record<string, PropertyNearbyPlace[]>);
    
        setIsLoading(false);
        return groupedResults;
      }
      
    } catch (error) {
      console.error("useNearbyPlaces: Error in fetchPlaces:", error);
      toast({
        title: "Error",
        description: `Failed to fetch ${categoryName} places. Please try again.`,
        variant: "destructive"
      });
      setIsLoading(false);
      return null;
    }
  }, [formData.id, formData.latitude, formData.longitude, toast]);

  const saveSelectedPlaces = useCallback(async (selectedPlaces: PropertyNearbyPlace[]) => {
    if (!formData.id) {
      toast({
        title: "Error",
        description: "Property ID is missing. Please save the property first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const existingPlaces = formData.nearby_places || [];
      const newPlaces = selectedPlaces.filter(newPlace => 
        !existingPlaces.some(existingPlace => existingPlace.id === newPlace.id)
      );
      
      const combinedPlaces = [...existingPlaces, ...newPlaces];
      
      onFieldChange("nearby_places", combinedPlaces);
      
      console.log("Saving places to Supabase:", combinedPlaces);
      const jsonPlaces = preparePropertiesForJsonField(combinedPlaces);
      const { error } = await supabase
        .from('properties')
        .update({ nearby_places: jsonPlaces as any })
        .eq('id', formData.id);
      
      if (error) {
        console.error("Error saving places to Supabase:", error);
        throw error;
      }
      
      toast({
        title: "Places saved",
        description: `Added ${newPlaces.length} places to the property`
      });
      
      return combinedPlaces;
    } catch (error) {
      console.error("Error saving selected places:", error);
      toast({
        title: "Error",
        description: "Failed to save places to the database",
        variant: "destructive"
      });
    }
  }, [formData.id, formData.nearby_places, onFieldChange, toast]);

  const removePlaceAtIndex = useCallback(async (index: number) => {
    if (!formData.nearby_places || !formData.id) return;
    
    try {
      const updatedPlaces = [...formData.nearby_places];
      updatedPlaces.splice(index, 1);
      
      onFieldChange("nearby_places", updatedPlaces);
      
      const jsonPlaces = preparePropertiesForJsonField(updatedPlaces);
      const { error } = await supabase
        .from('properties')
        .update({ nearby_places: jsonPlaces as any })
        .eq('id', formData.id);
      
      if (error) {
        console.error("Error removing place from Supabase:", error);
        throw error;
      }
      
      toast({
        title: "Place removed",
        description: "Nearby place has been removed successfully"
      });
    } catch (error) {
      console.error("Error removing place:", error);
      toast({
        title: "Error",
        description: "Failed to remove the place from the database",
        variant: "destructive"
      });
    }
  }, [formData.nearby_places, formData.id, onFieldChange, toast]);

  return {
    fetchPlaces,
    saveSelectedPlaces,
    removePlaceAtIndex,
    searchResults,
    isLoading
  };
}
