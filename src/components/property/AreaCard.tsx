
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyArea, PropertyImage } from "@/types/property";
import { AreaCardHeader } from "./area/AreaCardHeader";
import { AreaDescriptionSection } from "./area/AreaDescriptionSection";
import { AreaColumnsSelector } from "./area/AreaColumnsSelector";
import { AreaImageGridSection } from "./area/AreaImageGridSection";
import { AreaImageSelectDialog } from "./area/AreaImageSelectDialog";
import { AreaDescriptionGeneratorDialog } from "./area/AreaDescriptionGeneratorDialog";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAreaImages } from "@/hooks/areas/useAreaImages";
import { useAreaDescriptionGenerator } from "@/hooks/areas/useAreaDescriptionGenerator";

interface AreaCardProps {
  area: PropertyArea;
  images: PropertyImage[];
  propertyId?: string;
  isFirstArea?: boolean;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof PropertyArea, value: string | string[] | number) => void;
  onImageRemove: (id: string, imageId: string) => void;
  onImagesSelect?: (id: string, imageIds: string[]) => void;
  onReorderImages?: (id: string, reorderedImageIds: string[]) => void;
}

export function AreaCard({
  area,
  images,
  propertyId,
  isFirstArea = false,
  onRemove,
  onUpdate,
  onImageRemove,
  onImagesSelect,
  onReorderImages,
}: AreaCardProps) {
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isFirstArea);
  const { toast } = useToast();
  
  // Use our extracted hooks
  const { images: areaImages, setImages: setAreaImages } = useAreaImages(area.id, propertyId, area.images);
  
  const { 
    isGenerating, 
    keywordsForDescription, 
    setKeywordsForDescription, 
    isDialogOpen: isGenerateDialogOpen, 
    setIsDialogOpen: setIsGenerateDialogOpen, 
    generateDescription 
  } = useAreaDescriptionGenerator(area.id, area.title);

  const handleUpdateTitle = (value: string) => {
    onUpdate(area.id, "title", value);
  };

  const handleUpdateDescription = (value: string) => {
    onUpdate(area.id, "description", value);
  };

  const handleUpdateColumns = (columns: number) => {
    onUpdate(area.id, "columns", columns);
  };

  const handleUpdateImageIds = (imageIds: string[]) => {
    console.log(`Updating area ${area.id} image IDs:`, imageIds);
    if (onImagesSelect) {
      onImagesSelect(area.id, imageIds);
    }
  };

  const handleImagesReorder = async (areaId: string, reorderedImageIds: string[]) => {
    console.log(`Reordering images for area ${areaId}:`, reorderedImageIds);
    
    if (propertyId) {
      try {
        // Update sort order for each image based on its position in the reorderedImageIds array
        for (let i = 0; i < reorderedImageIds.length; i++) {
          const { error } = await supabase
            .from('property_images')
            .update({ sort_order: i })
            .eq('id', reorderedImageIds[i])
            .eq('property_id', propertyId);
            
          if (error) {
            console.error(`Error updating sort order for image ${reorderedImageIds[i]}:`, error);
            throw error;
          }
        }
        
        toast({
          title: "Images reordered",
          description: "The display order of images has been updated.",
        });
        
        // Update local state to reflect the new order
        if (areaImages.length > 0) {
          // Create a new array of images in the reordered sequence
          const newOrderedImages = reorderedImageIds.map(
            id => areaImages.find(img => img.id === id)
          ).filter((img): img is PropertyImage => img !== undefined);
          
          setAreaImages(newOrderedImages);
        }
        
        // Call the parent handler if provided
        if (onReorderImages) {
          onReorderImages(areaId, reorderedImageIds);
        }
      } catch (err) {
        console.error("Error updating image order:", err);
        toast({
          title: "Error",
          description: "Failed to update image order",
          variant: "destructive",
        });
      }
    } else if (onReorderImages) {
      // If no propertyId but we have a handler, call it directly
      onReorderImages(areaId, reorderedImageIds);
    }
  };

  const handleGenerateDescription = async () => {
    const generatedDescription = await generateDescription();
    if (generatedDescription) {
      handleUpdateDescription(generatedDescription);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Card>
      <AreaCardHeader
        title={area.title}
        areaId={area.id}
        onTitleChange={handleUpdateTitle}
        onRemove={() => onRemove(area.id)}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpand}
          aria-label={isExpanded ? "Collapse area" : "Expand area"}
          type="button"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </AreaCardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <AreaDescriptionSection
            description={area.description}
            areaId={area.id}
            onDescriptionChange={handleUpdateDescription}
            onGenerateClick={() => setIsGenerateDialogOpen(true)}
          />
          
          <AreaColumnsSelector
            columns={area.columns || 2}
            areaId={area.id}
            onColumnsChange={handleUpdateColumns}
          />

          <AreaImageGridSection
            areaId={area.id}
            areaTitle={area.title}
            areaImages={areaImages}
            onSelectClick={() => setIsSelectDialogOpen(true)}
            onImageRemove={onImageRemove}
            onImagesReorder={handleImagesReorder}
          />
        </CardContent>
      )}
      
      <AreaImageSelectDialog
        open={isSelectDialogOpen}
        onOpenChange={setIsSelectDialogOpen}
        images={images}
        areaTitle={area.title}
        selectedImageIds={areaImages.map(img => img.id)}
        onUpdate={handleUpdateImageIds}
      />

      <AreaDescriptionGeneratorDialog
        open={isGenerateDialogOpen}
        onOpenChange={setIsGenerateDialogOpen}
        areaTitle={area.title}
        keywords={keywordsForDescription}
        onKeywordsChange={setKeywordsForDescription}
        onGenerate={handleGenerateDescription}
        isGenerating={isGenerating}
      />
    </Card>
  );
}
