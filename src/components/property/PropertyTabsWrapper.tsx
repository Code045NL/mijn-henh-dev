import { PropertyTabs } from "./PropertyTabs";
import { PropertyTabContents } from "./tabs/wrapper/PropertyTabContents";
import { PropertyData, PropertyFormData } from "@/types/property";
import { usePropertyTabs } from "@/hooks/usePropertyTabs";
import { PropertyFormManager } from "./tabs/wrapper/PropertyFormManager";
import { PropertyTabActionsHandler } from "./tabs/wrapper/PropertyTabActionsHandler";
import { PropertyWebViewDialog } from "./tabs/wrapper/PropertyWebViewDialog";
import { Tabs } from "@/components/ui/tabs";

interface PropertyTabsWrapperProps {
  property: PropertyData;
  settings: any;
  onSave?: () => void;
  onDelete?: () => Promise<void>;
  agentInfo?: { id: string; name: string } | null;
  templateInfo?: { id: string; name: string } | null;
}

export function PropertyTabsWrapper({
  property,
  settings,
  onSave,
  onDelete,
  agentInfo,
  templateInfo
}: PropertyTabsWrapperProps) {
  const { activeTab, setActiveTab } = usePropertyTabs();
  console.log("PropertyTabsWrapper - Active tab:", activeTab);
  
  // Cast property to PropertyFormData with as assertion to ensure TypeScript compatibility
  const propertyAsFormData = property as unknown as PropertyFormData;
  
  return (
    <div className="space-y-6">
      <PropertyTabActionsHandler propertyId={property.id}>
        {({ webViewOpen, setWebViewOpen, handleGeneratePDF, handleOpenWebView }) => (
          <PropertyFormManager property={propertyAsFormData}>
            {({ 
              formState, 
              handleFieldChange,
              handleSaveObjectId,
              handleSaveAgent,
              handleSaveTemplate,
              addFeature,
              removeFeature,
              updateFeature,
              addArea,
              removeArea,
              updateArea,
              handleAreaImageRemove,
              handleAreaImagesSelect,
              handleAreaImageUpload,
              handleImageUpload,
              handleRemoveImage,
              isUploading,
              handleAreaPhotosUpload,
              handleRemoveAreaPhoto,
              handleFloorplanUpload,
              handleRemoveFloorplan,
              isUploadingFloorplan,
              handleSetFeaturedImage,
              handleToggleFeaturedImage,
              handleVirtualTourUpdate,
              handleYoutubeUrlUpdate,
              handleFloorplanEmbedScriptUpdate,
              onSubmit,
              currentStep,
              handleStepClick,
              propertyWithRequiredProps,
              lastSaved,
              isSaving,
              setPendingChanges,
              onFetchLocationData,
              onGenerateLocationDescription,
              onGenerateMap,
              onRemoveNearbyPlace,
              isLoadingLocationData,
              isGeneratingMap,
              onFetchCategoryPlaces,
              onFetchNearbyCities
            }) => (
              <>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <PropertyTabs activeTab={activeTab} handleTabChange={setActiveTab}>
                    <PropertyTabContents
                      activeTab={activeTab}
                      property={propertyWithRequiredProps}
                      formState={formState}
                      agentInfo={agentInfo || { id: '', name: '' }}
                      templateInfo={templateInfo || { id: 'default', name: 'Default Template' }}
                      isUpdating={false}
                      onSave={onSave}
                      onDelete={onDelete}
                      handleSaveObjectId={handleSaveObjectId}
                      handleSaveAgent={handleSaveAgent}
                      handleSaveTemplate={handleSaveTemplate}
                      handleGeneratePDF={handleGeneratePDF}
                      handleWebView={handleOpenWebView}
                      onFieldChange={handleFieldChange}
                      onAddFeature={addFeature}
                      onRemoveFeature={removeFeature}
                      onUpdateFeature={updateFeature}
                      onAddArea={addArea}
                      onRemoveArea={removeArea}
                      onUpdateArea={updateArea}
                      onAreaImageRemove={handleAreaImageRemove}
                      onAreaImagesSelect={handleAreaImagesSelect}
                      onAreaImageUpload={handleAreaImageUpload}
                      handleImageUpload={handleImageUpload}
                      handleRemoveImage={handleRemoveImage}
                      isUploading={isUploading}
                      handleAreaPhotosUpload={handleAreaPhotosUpload}
                      handleFloorplanUpload={handleFloorplanUpload}
                      handleRemoveFloorplan={handleRemoveFloorplan}
                      isUploadingFloorplan={isUploadingFloorplan}
                      handleSetFeaturedImage={handleSetFeaturedImage}
                      handleToggleFeaturedImage={handleToggleFeaturedImage}
                      handleVirtualTourUpdate={handleVirtualTourUpdate}
                      handleYoutubeUrlUpdate={handleYoutubeUrlUpdate}
                      handleFloorplanEmbedScriptUpdate={handleFloorplanEmbedScriptUpdate}
                      currentStep={currentStep}
                      handleStepClick={handleStepClick}
                      onSubmit={onSubmit}
                      handleRemoveAreaPhoto={handleRemoveAreaPhoto}
                      setPendingChanges={setPendingChanges}
                      isSaving={isSaving}
                      onFetchLocationData={onFetchLocationData}
                      onGenerateLocationDescription={onGenerateLocationDescription}
                      onGenerateMap={onGenerateMap}
                      onRemoveNearbyPlace={onRemoveNearbyPlace}
                      isLoadingLocationData={isLoadingLocationData}
                      isGeneratingMap={isGeneratingMap}
                      onFetchCategoryPlaces={onFetchCategoryPlaces}
                      onFetchNearbyCities={onFetchNearbyCities}
                    />
                  </PropertyTabs>
                </Tabs>

                {/* WebView Dialog */}
                <PropertyWebViewDialog
                  propertyData={propertyWithRequiredProps}
                  isOpen={webViewOpen}
                  onOpenChange={setWebViewOpen}
                />
              </>
            )}
          </PropertyFormManager>
        )}
      </PropertyTabActionsHandler>
    </div>
  );
}
