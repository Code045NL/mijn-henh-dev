
import { PropertyFormData } from "@/types/property";
import { PropertyFormContent } from "@/components/property/form/PropertyFormContent";

interface PropertyContentFormProps {
  step: number;
  formData: PropertyFormData;
  onFieldChange: (field: keyof PropertyFormData, value: any) => void;
  onAddFeature: () => void;
  onRemoveFeature: (id: string) => void;
  onUpdateFeature: (id: string, description: string) => void;
  onAddArea: () => void;
  onRemoveArea: (id: string) => void;
  onUpdateArea: (id: string, field: any, value: any) => void;
  onAreaImageUpload: (areaId: string, files: FileList) => void;
  onAreaImageRemove: (areaId: string, imageId: string) => void;
  onAreaImagesSelect: (areaId: string, imageIds: string[]) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAreaPhotosUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  handleRemoveAreaPhoto: (index: number) => void;
  handleMapImageDelete?: () => Promise<void>;
  onFetchLocationData?: () => Promise<void>;
  onRemoveNearbyPlace?: (index: number) => void;
  handleSetFeaturedImage?: (url: string | null) => void;
  handleToggleFeaturedImage?: (url: string) => void;
  isUploading?: boolean;
  setPendingChanges: (pending: boolean) => void;
}

export function PropertyContentForm({
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
  handleRemoveImage,
  handleRemoveAreaPhoto,
  handleMapImageDelete,
  onFetchLocationData,
  onRemoveNearbyPlace,
  handleSetFeaturedImage,
  handleToggleFeaturedImage,
  isUploading,
  setPendingChanges
}: PropertyContentFormProps) {
  const handleFieldChangeWithTracking = (field: keyof PropertyFormData, value: any) => {
    onFieldChange(field, value);
    setPendingChanges(true);
  };

  const wrappedAddFeature = () => {
    onAddFeature();
    setPendingChanges(true);
  };

  const wrappedRemoveFeature = (id: string) => {
    onRemoveFeature(id);
    setPendingChanges(true);
  };

  const wrappedUpdateFeature = (id: string, description: string) => {
    onUpdateFeature(id, description);
    setPendingChanges(true);
  };

  const wrappedAddArea = () => {
    onAddArea();
    setPendingChanges(true);
  };

  const wrappedRemoveArea = (id: string) => {
    onRemoveArea(id);
    setPendingChanges(true);
  };

  const wrappedUpdateArea = (id: string, field: any, value: any) => {
    onUpdateArea(id, field, value);
    setPendingChanges(true);
  };

  const safeSetFeaturedImage = (url: string | null) => {
    if (handleSetFeaturedImage) {
      handleSetFeaturedImage(url);
      setPendingChanges(true);
    }
  };

  const safeToggleFeaturedImage = (url: string) => {
    if (handleToggleFeaturedImage) {
      handleToggleFeaturedImage(url);
      setPendingChanges(true);
    }
  };

  return (
    <PropertyFormContent
      step={step}
      formData={formData}
      onFieldChange={handleFieldChangeWithTracking}
      onAddFeature={wrappedAddFeature}
      onRemoveFeature={wrappedRemoveFeature}
      onUpdateFeature={wrappedUpdateFeature}
      onAddArea={wrappedAddArea}
      onRemoveArea={wrappedRemoveArea}
      onUpdateArea={wrappedUpdateArea}
      onAreaImageUpload={onAreaImageUpload}
      onAreaImageRemove={onAreaImageRemove}
      onAreaImagesSelect={onAreaImagesSelect}
      handleImageUpload={handleImageUpload}
      handleAreaPhotosUpload={handleAreaPhotosUpload}
      handleRemoveImage={handleRemoveImage}
      handleRemoveAreaPhoto={handleRemoveAreaPhoto}
      handleMapImageDelete={handleMapImageDelete}
      onFetchLocationData={onFetchLocationData}
      onRemoveNearbyPlace={onRemoveNearbyPlace}
      handleSetFeaturedImage={safeSetFeaturedImage}
      handleToggleFeaturedImage={safeToggleFeaturedImage}
      isUploading={isUploading}
    />
  );
}
