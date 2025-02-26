
import { useState, useEffect } from "react";
import { AgencySettings } from "@/types/agency";
import { useToast } from "@/components/ui/use-toast";
import { fetchAgencySettings } from "@/utils/fetchAgencySettings";
import { defaultAgencySettings } from "@/utils/defaultAgencySettings";
import { agencySettingsService } from "@/services/agencySettingsService";
import { useLogoUpload } from "./useLogoUpload";

export const useAgencySettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AgencySettings>(defaultAgencySettings);
  const { logoPreview, setLogoPreview, handleLogoUpload } = useLogoUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let logoUrl = settings.logoUrl;

      if (logoPreview && !logoPreview.startsWith('http')) {
        const file = await (await fetch(logoPreview)).blob();
        const filename = `logo-${Date.now()}.png`;
        logoUrl = await agencySettingsService.uploadLogo(file, filename);
      }

      const updateData = {
        ...settings,
        logoUrl
      };

      if (settings.id) {
        await agencySettingsService.updateSettings(settings.id, updateData);
      } else {
        const createData = {
          name: settings.name,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
          logo_url: logoUrl,
          pdf_background_url: settings.pdfBackgroundUrl,
          webview_background_url: settings.webviewBackgroundUrl,
          icon_build_year: settings.iconBuildYear,
          icon_bedrooms: settings.iconBedrooms,
          icon_bathrooms: settings.iconBathrooms,
          icon_garages: settings.iconGarages,
          icon_energy_class: settings.iconEnergyClass,
          icon_sqft: settings.iconSqft,
          icon_living_space: settings.iconLivingSpace,
          google_maps_api_key: settings.googleMapsApiKey,
          xml_import_url: settings.xmlImportUrl,
          instagram_url: settings.instagramUrl,
          youtube_url: settings.youtubeUrl,
          facebook_url: settings.facebookUrl
        };
        await agencySettingsService.createSettings(createData);
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });

      const newSettings = await fetchAgencySettings();
      if (newSettings) {
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePdfBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const filename = `pdf-bg-${Date.now()}.${file.name.split('.').pop()}`;
      const url = await agencySettingsService.uploadBackground(file, filename);
      
      if (settings.id) {
        await agencySettingsService.updateSettings(settings.id, {
          ...settings,
          pdfBackgroundUrl: url
        });

        const newSettings = await fetchAgencySettings();
        if (newSettings) {
          setSettings(newSettings);
        }
      } else {
        setSettings(prev => ({
          ...prev,
          pdfBackgroundUrl: url
        }));
      }

      toast({
        title: "Success",
        description: "PDF background image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading PDF background image:', error);
      toast({
        title: "Error",
        description: "Failed to upload PDF background image",
        variant: "destructive",
      });
    }
  };

  const handleWebviewBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const filename = `webview-bg-${Date.now()}.${file.name.split('.').pop()}`;
      const url = await agencySettingsService.uploadBackground(file, filename);
      
      if (settings.id) {
        await agencySettingsService.updateSettings(settings.id, {
          ...settings,
          webviewBackgroundUrl: url
        });

        const newSettings = await fetchAgencySettings();
        if (newSettings) {
          setSettings(newSettings);
        }
      } else {
        setSettings(prev => ({
          ...prev,
          webviewBackgroundUrl: url
        }));
      }

      toast({
        title: "Success",
        description: "Webview background image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading webview background image:', error);
      toast({
        title: "Error",
        description: "Failed to upload webview background image",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAgencySettings();
      if (data) {
        setSettings(data);
        if (data.logoUrl) {
          setLogoPreview(data.logoUrl);
        }
      }
    };
    loadSettings();
  }, []);

  return {
    settings,
    logoPreview,
    isLoading,
    handleSubmit,
    handleChange,
    handleSelectChange,
    handleLogoUpload,
    handlePdfBackgroundUpload,
    handleWebviewBackgroundUpload,
  };
};
