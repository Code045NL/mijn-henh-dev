
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyImage } from "@/types/property";

interface MediaDatabaseFetcherProps {
  propertyId?: string;
  images?: PropertyImage[];
  onFetchComplete: (images: PropertyImage[]) => void;
}

export function MediaDatabaseFetcher({
  propertyId,
  images,
  onFetchComplete
}: MediaDatabaseFetcherProps) {
  useEffect(() => {
    console.log("MediaDatabaseFetcher - checking if fetch needed", {propertyId, imagesLength: images?.length});
    
    if (propertyId && (!images || images.length === 0)) {
      const fetchImages = async () => {
        try {
          console.log("MediaDatabaseFetcher - fetching images for property:", propertyId);
          
          const { data, error } = await supabase
            .from('property_images')
            .select('id, url, is_main, is_featured_image')
            .eq('property_id', propertyId)
            .eq('type', 'image')
            .order('created_at', { ascending: false });
            
          if (error) {
            console.error("MediaDatabaseFetcher - Error fetching images:", error);
            throw error;
          }
          
          if (data && data.length > 0) {
            // Transform to PropertyImage objects
            const dbImages: PropertyImage[] = data.map(item => ({
              id: item.id,
              url: item.url,
              is_main: item.is_main,
              is_featured_image: item.is_featured_image
            }));
            
            console.log("MediaDatabaseFetcher - Fetched images from DB:", dbImages);
            onFetchComplete(dbImages);
          } else {
            console.log("MediaDatabaseFetcher - No images found in DB");
            onFetchComplete([]);
          }
        } catch (error) {
          console.error("Error fetching images from database:", error);
          onFetchComplete([]);
        }
      };
      
      fetchImages();
    }
  }, [propertyId, images, onFetchComplete]);

  return null; // This is a logic-only component with no UI
}
