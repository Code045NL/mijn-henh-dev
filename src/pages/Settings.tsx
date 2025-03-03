
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAgencySettings } from "@/hooks/useAgencySettings";
import { SettingsTab } from "@/types/settings";
import { AgencyTab } from "@/components/settings/AgencyTab";
import { DesignTab } from "@/components/settings/DesignTab";
import { AdvancedTab } from "@/components/settings/AdvancedTab";
import { AppwriteSettings } from "@/components/settings/AppwriteSettings";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("agency");
  const {
    settings,
    logoPreview,
    isLoading,
    handleSubmit,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleLogoUpload,
    handlePdfBackgroundUpload,
    handleWebviewBackgroundUpload,
  } = useAgencySettings();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          onClick={() => setActiveTab("agency")} 
          variant={activeTab === "agency" ? "default" : "outline"}
        >
          Agency Details
        </Button>
        <Button 
          onClick={() => setActiveTab("design")} 
          variant={activeTab === "design" ? "default" : "outline"}
        >
          Design
        </Button>
        <Button 
          onClick={() => setActiveTab("advanced")} 
          variant={activeTab === "advanced" ? "default" : "outline"}
        >
          Advanced
        </Button>
        <Button 
          onClick={() => setActiveTab("appwrite")} 
          variant={activeTab === "appwrite" ? "default" : "outline"}
        >
          Appwrite
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {activeTab === "agency" && (
          <AgencyTab
            settings={settings}
            logoPreview={logoPreview}
            onChange={handleChange}
            onLogoUpload={handleLogoUpload}
          />
        )}
        
        {activeTab === "design" && (
          <DesignTab
            settings={settings}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            onPdfBackgroundUpload={handlePdfBackgroundUpload}
            onWebviewBackgroundUpload={handleWebviewBackgroundUpload}
          />
        )}
        
        {activeTab === "advanced" && (
          <AdvancedTab
            settings={settings}
            onChange={handleChange}
            onSwitchChange={handleSwitchChange}
          />
        )}
        
        {activeTab === "appwrite" && (
          <AppwriteSettings
            settings={settings}
            onChange={handleChange}
          />
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}

export default Settings;
