
import React from "react";
import { 
  PropertyFormManagerChildrenProps 
} from "@/components/property/tabs/wrapper/types/PropertyFormManagerTypes";
import { PropertyData, PropertyFormData } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MinusCircle, Save } from "lucide-react";

interface FeaturesStepProps {
  features: any;
  onAddFeature: () => void;
  onRemoveFeature: (id: string) => void;
  onUpdateFeature: (id: string, description: string) => void;
}

interface AreasStepProps {
  areas: any;
  onAddArea: () => void;
  onRemoveArea: (id: string) => void;
  onUpdateArea: (id: string, field: string, value: any) => void;
  onAreaImageUpload: (areaId: string, files: FileList) => Promise<void>;
}

interface FeaturesProps {
  features: any;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, description: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

function Features({
  features = [],
  onAdd,
  onRemove,
  onUpdate,
  onSave,
  isSaving = false,
}: FeaturesProps) {
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Adding new feature");
    onAdd();
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    console.log("Removing feature with ID:", id);
    onRemove(id);
  };

  const handleUpdate = (id: string, value: string) => {
    console.log("Updating feature:", id, value);
    onUpdate(id, value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Features</Label>
        <div className="flex gap-2">
          {onSave && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Features
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </div>
      {features.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No features added yet. Click the button above to add features.
        </p>
      ) : (
        features.map((feature) => (
          <div key={feature.id} className="flex items-center gap-2">
            <Input
              value={feature.description}
              onChange={(e) => handleUpdate(feature.id, e.target.value)}
              placeholder="Enter feature"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => handleRemove(e, feature.id)}
            >
              <MinusCircle className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

interface AreasProps {
  areas: any;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: any) => void;
  onAreaImageUpload: (areaId: string, files: FileList) => Promise<void>;
  onSave?: () => void;
  isSaving?: boolean;
}

function Areas({
  areas = [],
  onAdd,
  onRemove,
  onUpdate,
  onAreaImageUpload,
  onSave,
  isSaving = false
}: AreasProps) {
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    onAdd();
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onRemove(id);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    onUpdate(id, field, value);
  };

  const handleAreaImageUpload = async (areaId: string, files: FileList) => {
    await onAreaImageUpload(areaId, files);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Areas</Label>
        <div className="flex gap-2">
          {onSave && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Areas
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Area
          </Button>
        </div>
      </div>
      {areas.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No areas added yet. Click the button above to add areas.
        </p>
      ) : (
        areas.map((area) => (
          <div key={area.id} className="space-y-2 border p-4 rounded-md">
            <div className="flex items-center gap-2">
              <Input
                value={area.name}
                onChange={(e) => handleUpdate(area.id, 'name', e.target.value)}
                placeholder="Enter area name"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => handleRemove(e, area.id)}
              >
                <MinusCircle className="w-4 h-4 text-destructive" />
              </Button>
            </div>
            <Input
              value={area.size}
              onChange={(e) => handleUpdate(area.id, 'size', e.target.value)}
              placeholder="Enter area size"
            />
            <Input
              value={area.title}
              onChange={(e) => handleUpdate(area.id, 'title', e.target.value)}
              placeholder="Enter area title"
            />
            <Input
              value={area.description}
              onChange={(e) => handleUpdate(area.id, 'description', e.target.value)}
              placeholder="Enter area description"
            />
            <Input
              type="file"
              onChange={(e) => {
                if (e.target.files) {
                  handleAreaImageUpload(area.id, e.target.files);
                }
              }}
            />
          </div>
        ))
      )}
    </div>
  );
}

export function PropertyFormContent({
  currentStep,
  handleStepClick,
  formState,
  handleFieldChange,
  addFeature,
  removeFeature,
  updateFeature,
  addArea,
  removeArea,
  updateArea,
  handleAreaImageUpload,
  onSubmit,
  isSaving,
  setPendingChanges
}: PropertyFormManagerChildrenProps) {

  // Modified to remove the event parameter and make the signature match what is expected
  const handleSaveClick = () => {
    console.log("Save button clicked in PropertyFormContent");
    // Set pending changes to true when user saves
    if (setPendingChanges) setPendingChanges(true);
    onSubmit();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              value={formState.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
            />
            <Label htmlFor="price">Price</Label>
            <Input
              type="text"
              id="price"
              value={formState.price}
              onChange={(e) => handleFieldChange('price', e.target.value)}
            />
            <Button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving}
              className="mt-4 flex items-center gap-2"
              size="sm"
            >
              <Save className="w-4 h-4" />
              Save Basic Info
            </Button>
          </div>
        );
      case 1:
        return (
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              value={formState.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
            />
            <Label htmlFor="description">Description</Label>
            <Input
              type="text"
              id="description"
              value={formState.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
            />
            <Button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving}
              className="mt-4 flex items-center gap-2"
              size="sm"
            >
              <Save className="w-4 h-4" />
              Save Location
            </Button>
          </div>
        );
      case 2:
        return (
          <Features
            features={formState.features}
            onAdd={addFeature}
            onRemove={removeFeature}
            onUpdate={updateFeature}
            onSave={handleSaveClick}
            isSaving={isSaving}
          />
        );
      case 3:
        return (
          <Areas
            areas={formState.areas}
            onAdd={addArea}
            onRemove={removeArea}
            onUpdate={updateArea}
            onAreaImageUpload={handleAreaImageUpload}
            onSave={handleSaveClick}
            isSaving={isSaving}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div>{renderStepContent()}</div>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSaveClick}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
