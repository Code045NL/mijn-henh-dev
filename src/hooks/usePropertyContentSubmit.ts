
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PropertyFormData } from "@/types/property";
import { usePropertyFormSubmit } from "@/hooks/usePropertyFormSubmit";

export function usePropertyContentSubmit(
  formData: PropertyFormData,
  setPendingChanges: (pending: boolean) => void,
  setLastSaved: (date: Date | null) => void,
  externalOnSubmit?: () => void
) {
  const { toast } = useToast();
  const { handleSubmit } = usePropertyFormSubmit();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async () => {
    console.log("Submit called in usePropertyContentSubmit");
    setIsSaving(true);
    
    try {
      // If there's an external submit handler provided, use that
      if (externalOnSubmit) {
        console.log("Using external onSubmit handler");
        externalOnSubmit();
      } else {
        console.log("Using default submit handler");
        
        // Final save when clicking submit
        if (formData.id) {
          try {
            // Create a form event to pass to handleSubmit
            const formEvent = {} as React.FormEvent;
            // Always pass false for redirectAfterSave to prevent any redirects
            const success = await handleSubmit(formEvent, formData, false);
            
            if (success) {
              setLastSaved(new Date());
              setPendingChanges(false);
              toast({
                title: "Success",
                description: "All changes have been saved",
              });
            }
          } catch (error) {
            console.error("Final save failed:", error);
            toast({
              title: "Error",
              description: "Failed to save all changes",
              variant: "destructive",
            });
          }
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return { onSubmit, isSaving };
}
