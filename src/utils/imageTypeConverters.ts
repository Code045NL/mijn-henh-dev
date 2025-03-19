
import { PropertyImage, PropertyFloorplan } from "@/types/property";

/**
 * Convert a URL string to a PropertyImage object
 */
export function toPropertyImage(url: string): PropertyImage {
  return {
    id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    url,
    type: "image"
  };
}

/**
 * Convert a URL string to a PropertyFloorplan object
 */
export function toPropertyFloorplan(url: string): PropertyFloorplan {
  return {
    id: `flp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    url,
    type: "floorplan"
  };
}

/**
 * Convert PropertyImage array to PropertyFloorplan array
 */
export function convertToFloorplanArray(images: PropertyImage[]): PropertyFloorplan[] {
  return images
    .filter(img => img.type === "floorplan")
    .map(img => ({
      id: img.id,
      url: img.url,
      title: img.title,
      description: img.description,
      filePath: img.filePath,
      sort_order: img.sort_order,
      property_id: img.property_id,
      alt: img.alt,
      type: "floorplan"
    }));
}

/**
 * Convert mixed array to PropertyImage array
 */
export function convertToImageArray(items: any[]): PropertyImage[] {
  return items.map(item => {
    if (typeof item === 'string') {
      return toPropertyImage(item);
    }
    return {
      id: item.id || `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url: item.url,
      type: item.type || "image",
      title: item.title,
      description: item.description,
      alt: item.alt,
      is_main: item.is_main,
      is_featured_image: item.is_featured_image,
      sort_order: item.sort_order,
      property_id: item.property_id,
      area: item.area,
      filePath: item.filePath
    };
  });
}
