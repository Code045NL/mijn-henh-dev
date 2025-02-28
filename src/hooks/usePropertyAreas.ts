
import { useState } from 'react';
import type { PropertyArea, PropertyFormData } from '@/types/property';

export function usePropertyAreas(
  formData: PropertyFormData,
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>
) {
  // Add a new area to the property
  const addArea = () => {
    const newArea: PropertyArea = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      imageIds: [],
      columns: 2 // Default to 2 columns
    };
    
    console.log("Adding new area with default columns:", newArea);
    
    setFormData({
      ...formData,
      areas: [...(formData.areas || []), newArea],
    });
  };

  // Remove an area from the property
  const removeArea = (id: string) => {
    console.log(`Removing area ${id}`);
    
    setFormData({
      ...formData,
      areas: formData.areas.filter(area => area.id !== id),
    });
  };

  // Update a specific field of an area
  const updateArea = (id: string, field: keyof PropertyArea, value: string | string[] | number) => {
    console.log(`Updating area ${id}, field ${String(field)}, value:`, value);
    
    setFormData({
      ...formData,
      areas: formData.areas.map(area => 
        area.id === id ? { ...area, [field]: value } : area
      ),
    });
    
    // Log the updated areas for debugging
    const updatedAreas = formData.areas.map(area => 
      area.id === id ? { ...area, [field]: value } : area
    );
    console.log("Areas after update:", updatedAreas);
  };

  // Handle image upload for a specific area
  const handleAreaImageUpload = async (areaId: string, files: FileList) => {
    // Implementation for handling area image upload
    console.log(`Image upload for area ${areaId}, files:`, files);
    // This would typically involve uploading the images to your storage system
    // and then updating the area's imageIds
  };

  // Remove an image from an area
  const handleAreaImageRemove = (areaId: string, imageId: string) => {
    console.log(`Removing image ${imageId} from area ${areaId}`);
    
    setFormData({
      ...formData,
      areas: formData.areas.map(area => {
        if (area.id === areaId) {
          return {
            ...area,
            imageIds: (area.imageIds || []).filter(id => id !== imageId),
          };
        }
        return area;
      }),
    });
    
    // Log the updated areas for debugging
    const updatedAreas = formData.areas.map(area => {
      if (area.id === areaId) {
        return {
          ...area,
          imageIds: (area.imageIds || []).filter(id => id !== imageId),
        };
      }
      return area;
    });
    console.log("Areas after image removal:", updatedAreas);
  };

  // Select images from existing property images for an area
  const handleAreaImagesSelect = (areaId: string, imageIds: string[]) => {
    console.log(`Selecting images for area ${areaId}, imageIds:`, imageIds);
    
    setFormData({
      ...formData,
      areas: formData.areas.map(area => {
        if (area.id === areaId) {
          return {
            ...area,
            imageIds: imageIds,
          };
        }
        return area;
      }),
    });
    
    // Log the updated areas for debugging
    const updatedAreas = formData.areas.map(area => {
      if (area.id === areaId) {
        return {
          ...area,
          imageIds: imageIds,
        };
      }
      return area;
    });
    console.log("Areas after image selection:", updatedAreas);
  };

  return {
    addArea,
    removeArea,
    updateArea,
    handleAreaImageUpload,
    handleAreaImageRemove,
    handleAreaImagesSelect,
  };
}
