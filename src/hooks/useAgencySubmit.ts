
import { useState } from "react";
import { AgencySettings } from "@/types/agency";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PropertyFeature } from "@/types/property";

interface UseAgencySubmitProps {
  settings: AgencySettings;
  setSettings: (settings: AgencySettings) => void;
  logoPreview: string;
  globalFeatures?: PropertyFeature[];
}

export const useAgencySubmit = ({ 
  settings, 
  setSettings, 
  logoPreview,
  globalFeatures = []
}: UseAgencySubmitProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Make sure settings has an id
      if (!settings.id) {
        throw new Error("Settings ID is required for update");
      }

      // Convert globalFeatures to string array for database
      const featureDescriptions = globalFeatures.map(f => f.description);
      
      // Log the values before sending to the database
      console.log("Saving Nylas settings:", {
        clientId: settings.nylasClientId,
        apiKey: settings.nylasApiKey,
        grantId: settings.nylasGrantId,
      });
      
      const { data, error } = await supabase
        .from('agency_settings')
        .update({
          name: settings.name,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
          logo_url: logoPreview || settings.logoUrl,
          description_background_url: settings.webviewBgImage,
          facebook_url: settings.facebookUrl,
          instagram_url: settings.instagramUrl,
          youtube_url: settings.youtubeUrl,
          google_maps_api_key: settings.googleMapsApiKey,
          xml_import_url: settings.xmlImportUrl,
          icon_bedrooms: settings.iconBedrooms,
          icon_bathrooms: settings.iconBathrooms,
          icon_sqft: settings.iconSqft,
          icon_living_space: settings.iconLivingSpace,
          icon_build_year: settings.iconBuildYear,
          icon_garages: settings.iconGarages,
          icon_energy_class: settings.iconEnergyClass,
          // SMTP settings
          smtp_host: settings.smtpHost,
          smtp_port: settings.smtpPort,
          smtp_username: settings.smtpUsername,
          smtp_password: settings.smtpPassword,
          smtp_from_email: settings.smtpFromEmail,
          smtp_from_name: settings.smtpFromName,
          smtp_secure: settings.smtpSecure,
          
          // Resend settings
          resend_api_key: settings.resendApiKey,
          resend_from_email: settings.resendFromEmail,
          resend_from_name: settings.resendFromName,
          
          // IMAP settings
          imap_host: settings.imapHost,
          imap_port: settings.imapPort,
          imap_username: settings.imapUsername,
          imap_password: settings.imapPassword,
          imap_tls: settings.imapTls,
          imap_mailbox: settings.imapMailbox,
          
          // OpenAI API key
          openai_api_key: settings.openaiApiKey,
          
          // Nylas settings
          nylas_client_id: settings.nylasClientId,
          nylas_client_secret: settings.nylasApiKey || settings.nylasClientSecret,
          nylas_access_token: settings.nylasGrantId || settings.nylasAccessToken,
          
          // Global features
          global_features: featureDescriptions
        })
        .eq('id', settings.id);

      if (error) {
        console.error("Error updating settings:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });

      // Update the settings state with the latest data
      const { data: latestSettings, error: fetchError } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('id', settings.id)
        .single();

      if (!fetchError && latestSettings) {
        // Process the global_features field
        let globalFeaturesList: string[] = [];
        
        if (latestSettings.global_features) {
          // Handle either array or string format
          const gfValue = latestSettings.global_features;
          if (Array.isArray(gfValue)) {
            globalFeaturesList = gfValue as string[];
          } else if (typeof gfValue === 'string') {
            try {
              const parsed = JSON.parse(gfValue);
              if (Array.isArray(parsed)) {
                globalFeaturesList = parsed;
              }
            } catch (e) {
              console.error('Error parsing global_features:', e);
            }
          }
        }

        // Create a properly typed object to pass to setSettings
        const updatedSettings: AgencySettings = {
          id: latestSettings.id,
          name: latestSettings.name,
          email: latestSettings.email,
          phone: latestSettings.phone,
          address: latestSettings.address,
          primaryColor: latestSettings.primary_color,
          secondaryColor: latestSettings.secondary_color,
          logoUrl: latestSettings.logo_url,
          webviewBgImage: latestSettings.description_background_url,
          facebookUrl: latestSettings.facebook_url,
          instagramUrl: latestSettings.instagram_url,
          youtubeUrl: latestSettings.youtube_url,
          googleMapsApiKey: latestSettings.google_maps_api_key,
          xmlImportUrl: latestSettings.xml_import_url,
          iconBedrooms: latestSettings.icon_bedrooms,
          iconBathrooms: latestSettings.icon_bathrooms,
          iconSqft: latestSettings.icon_sqft,
          iconLivingSpace: latestSettings.icon_living_space,
          iconBuildYear: latestSettings.icon_build_year,
          iconGarages: latestSettings.icon_garages,
          iconEnergyClass: latestSettings.icon_energy_class,
          // SMTP settings
          smtpHost: latestSettings.smtp_host,
          smtpPort: latestSettings.smtp_port,
          smtpUsername: latestSettings.smtp_username,
          smtpPassword: latestSettings.smtp_password,
          smtpFromEmail: latestSettings.smtp_from_email,
          smtpFromName: latestSettings.smtp_from_name,
          smtpSecure: latestSettings.smtp_secure,
          // Resend settings
          resendApiKey: latestSettings.resend_api_key,
          resendFromEmail: latestSettings.resend_from_email,
          resendFromName: latestSettings.resend_from_name,
          // IMAP settings
          imapHost: latestSettings.imap_host,
          imapPort: latestSettings.imap_port,
          imapUsername: latestSettings.imap_username,
          imapPassword: latestSettings.imap_password,
          imapTls: latestSettings.imap_tls,
          imapMailbox: latestSettings.imap_mailbox,
          // OpenAI API key
          openaiApiKey: latestSettings.openai_api_key,
          // Nylas settings with new field names that match UI
          nylasClientId: latestSettings.nylas_client_id,
          nylasApiKey: latestSettings.nylas_client_secret,
          nylasGrantId: latestSettings.nylas_access_token,
          // For backwards compatibility
          nylasClientSecret: latestSettings.nylas_client_secret,
          nylasAccessToken: latestSettings.nylas_access_token,
          globalFeatures: globalFeaturesList
        };
        
        setSettings(updatedSettings);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit,
  };
};
