
import React from "react";
import { Area, PropertyImage } from "@/types/property";
import { getImageUrl } from "@/utils/propertyDataAdapters";

interface SingleAreaSectionProps {
  area: Area;
  areaImages: PropertyImage[] | string[];
  property?: any;  // Add property to the props
  settings?: any;  // Add settings to the props
  areaIndex?: number; // Add areaIndex to the props
}

export function SingleAreaSection({ area, areaImages, property, settings, areaIndex }: SingleAreaSectionProps) {
  // Convert all images to PropertyImage type
  const processedImages = areaImages.map(img => 
    typeof img === 'string' 
      ? { id: `img-${Math.random()}`, url: img, type: 'image' as const } 
      : img
  );

  return (
    <div className="section area-section">
      <div className="section-header">
        <h2 className="section-title">{area.title || area.name}</h2>
        {area.description && (
          <p className="section-description">{area.description}</p>
        )}
      </div>
      
      {processedImages.length > 0 && (
        <div className="area-images">
          {processedImages.map((img) => (
            <div key={img.id} className="area-image-item">
              <img 
                src={getImageUrl(img)} 
                alt={`${area.title || area.name} - ${img.id}`} 
                className="area-image"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
