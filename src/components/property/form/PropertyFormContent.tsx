import { PropertyFormData, PropertyArea, PropertyFeature, PropertyFloorplan } from "@/types/property";
import { steps } from "./formSteps";

interface PropertyFormContentProps {
  step: number;
  formData: PropertyFormData;
  onFieldChange: (field: keyof PropertyFormData, value: any) => void;
  onAddFeature: () => void;
  onRemoveFeature: (id: string) => void;
  onUpdateFeature: (id: string, description: string) => void;
  onAddArea: () => void;
  onRemoveArea: (id: string) => void;
  onUpdateArea: (id: string, field: keyof PropertyArea, value: string | string[] | number) => void;
  onAreaImageUpload: (areaId: string, files: FileList) => void;
  onAreaImageRemove: (areaId: string, imageId: string) => void;
  onAreaImagesSelect: (areaId: string, imageIds: string[]) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAreaPhotosUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFloorplanUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  handleRemoveAreaPhoto: (index: number) => void;
  handleRemoveFloorplan: (index: number) => void;
  handleUpdateFloorplan?: (index: number, field: keyof PropertyFloorplan, value: any) => void;
  handleSetFeaturedImage: (url: string) => void;
  handleToggleGridImage: (url: string) => void;
  handleMapImageDelete?: () => Promise<void>;
}

export function PropertyFormContent({
  step,
  formData,
  onFieldChange,
  onAddFeature,
  onRemoveFeature,
  onUpdateFeature,
  onAddArea,
  onRemoveArea,
  onUpdateArea,
  onAreaImageUpload,
  onAreaImageRemove,
  onAreaImagesSelect,
  handleImageUpload,
  handleAreaPhotosUpload,
  handleFloorplanUpload,
  handleRemoveImage,
  handleRemoveAreaPhoto,
  handleRemoveFloorplan,
  handleUpdateFloorplan,
  handleSetFeaturedImage,
  handleToggleGridImage,
  handleMapImageDelete,
}: PropertyFormContentProps) {
  
  // Find the step component that corresponds to the current step
  const StepComponent = steps.find(s => s.id === step)?.component;
  
  // Add defensive check
  if (!StepComponent) {
    console.error(`Step component not found for step: ${step}`);
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-500">Error: Step not found. Please try refreshing the page.</p>
      </div>
    );
  }

  // If formData is not available, show a loading state
  if (!formData) {
    return (
      <div className="py-4 flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Pass all props to the step component based on the type of step
  return (
    <div className="py-4 animate-fadeIn">
      {step === 4 ? (
        // FloorplansStep
        <StepComponent
          floorplans={formData.floorplans}
          onFloorplanUpload={handleFloorplanUpload}
          onRemoveFloorplan={handleRemoveFloorplan}
          onUpdateFloorplan={handleUpdateFloorplan}
        />
      ) : step === 5 ? (
        // AreasStep
        <StepComponent
          areas={formData.areas}
          images={formData.images}
          onAddArea={onAddArea}
          onRemoveArea={onRemoveArea}
          onUpdateArea={onUpdateArea}
          onAreaImageUpload={onAreaImageUpload}
          onAreaImageRemove={onAreaImageRemove}
          onAreaImagesSelect={onAreaImagesSelect}
        />
      ) : (
        // Other steps
        <StepComponent
          formData={formData}
          onFieldChange={onFieldChange}
          onAddFeature={onAddFeature}
          onRemoveFeature={onRemoveFeature}
          onUpdateFeature={onUpdateFeature}
          onAddArea={onAddArea}
          onRemoveArea={onRemoveArea}
          onUpdateArea={onUpdateArea}
          onAreaImageUpload={onAreaImageUpload}
          onAreaImageRemove={onAreaImageRemove}
          onAreaImagesSelect={onAreaImagesSelect}
          onFloorplanUpload={handleFloorplanUpload}
          onRemoveFloorplan={handleRemoveFloorplan}
          onUpdateFloorplan={handleUpdateFloorplan}
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          onAreaPhotosUpload={handleAreaPhotosUpload}
          onRemoveAreaPhoto={handleRemoveAreaPhoto}
          onSetFeaturedImage={handleSetFeaturedImage}
          onToggleGridImage={handleToggleGridImage}
          onMapImageDelete={handleMapImageDelete}
        />
      )}
    </div>
  );
}
