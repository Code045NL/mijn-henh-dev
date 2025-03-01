import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ContactFormProps {
  propertyId: string;
  propertyTitle?: string;
  agentId?: string;
}

const INQUIRY_TYPES = [
  { value: "information", label: "Meer informatie over deze woning" },
  { value: "viewing", label: "Een bezichtiging plannen" },
  { value: "offer", label: "Een bod uitbrengen" }
];

export function ContactForm({ propertyId, propertyTitle = "", agentId }: ContactFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, get the agent's details if agentId is provided
      let agentData = null;
      
      if (agentId) {
        const { data, error: agentError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', agentId)
          .single();

        if (agentError) throw agentError;
        agentData = data;
      }

      // Save the submission to the database
      const { data: submission, error } = await supabase
        .from('property_contact_submissions')
        .insert({
          property_id: propertyId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          inquiry_type: formData.inquiryType,
          message: formData.message,
          agent_id: agentId
        })
        .select()
        .single();

      if (error) throw error;

      // Send email notification to agent if agent exists, trying the SMTP service first
      if (agentData) {
        try {
          // Try to use SMTP service first
          const { error: smtpError } = await supabase.functions.invoke('send-email-with-smtp', {
            body: {
              to: agentData.email,
              subject: `New inquiry for ${propertyTitle || 'property'}`,
              html: `
                <h2>New Property Inquiry</h2>
                <p><strong>Name:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Phone:</strong> ${formData.phone}</p>
                <p><strong>Inquiry Type:</strong> ${formData.inquiryType}</p>
                <p><strong>Message:</strong> ${formData.message}</p>
                <p><strong>Property:</strong> ${propertyTitle || propertyId}</p>
              `,
              replyTo: formData.email
            }
          });

          // If SMTP fails, fall back to the default notification
          if (smtpError) {
            console.warn("SMTP email failed, falling back to default notification:", smtpError);
            await sendDefaultNotification();
          }
        } catch (emailError) {
          console.warn("SMTP email failed, falling back to default notification:", emailError);
          await sendDefaultNotification();
        }
      }

      toast({
        title: "Bericht verzonden",
        description: "We nemen zo spoedig mogelijk contact met u op!",
      });
      
      setFormData({ name: "", email: "", phone: "", inquiryType: "", message: "" });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Er is iets misgegaan bij het verzenden van uw bericht.",
        variant: "destructive"
      });
    }

    // Helper function to send the default notification
    async function sendDefaultNotification() {
      await supabase.functions.invoke('send-agent-notification', {
        body: {
          id: submission.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          inquiry_type: formData.inquiryType,
          property_title: propertyTitle,
          agent_email: agentData.email,
          agent_name: agentData.full_name
        }
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Contact Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-white/90">
              Naam
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="text-sm bg-white/10 border-white/20 text-white placeholder:text-white/60"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-white/90">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="text-sm bg-white/10 border-white/20 text-white placeholder:text-white/60"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-white/90">
              Telefoonnummer
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="text-sm bg-white/10 border-white/20 text-white placeholder:text-white/60"
              required
            />
          </div>
        </div>

        {/* Right Column - Message */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inquiryType" className="text-sm font-medium text-white/90">
              Ik wil
            </Label>
            <Select
              value={formData.inquiryType || "information"}
              onValueChange={(value) => setFormData(prev => ({ ...prev, inquiryType: value }))}
            >
              <SelectTrigger className="text-sm bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Selecteer een optie" />
              </SelectTrigger>
              <SelectContent>
                {INQUIRY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-white/90">
              Bericht
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Uw bericht..."
              className="text-sm h-[140px] bg-white/10 border-white/20 text-white placeholder:text-white/60"
              required
            />
          </div>
        </div>
      </div>

      <Button 
        type="submit"
        className="w-full h-12 text-sm font-medium bg-white text-gray-900 hover:bg-white/90 transition-colors"
      >
        Versturen
      </Button>
    </form>
  );
}
