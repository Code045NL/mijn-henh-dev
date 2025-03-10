
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useMarkAsRead(submissionId: string, onSuccess?: () => void) {
  const [isMarking, setIsMarking] = useState(false);
  const { toast } = useToast();

  const markAsRead = async () => {
    if (!submissionId) return;
    
    setIsMarking(true);
    try {
      const { error } = await supabase
        .from('property_contact_submissions')
        .update({ is_read: true })
        .eq('id', submissionId);
        
      if (error) throw error;
      
      toast({
        title: 'Marked as read',
        description: 'The submission has been marked as read',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark as read',
        variant: 'destructive',
      });
    } finally {
      setIsMarking(false);
    }
  };

  return { markAsRead, isMarking };
}
