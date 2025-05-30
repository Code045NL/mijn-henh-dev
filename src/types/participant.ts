
import { User } from "./user";

export type ParticipantRole = 'seller' | 'buyer' | 'agent';
export type ParticipantStatus = 'pending' | 'active' | 'declined';

export interface ParticipantProfileData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  date_of_birth?: string | null;
  place_of_birth?: string | null;
  identification?: {
    type?: "passport" | "IDcard" | null;
    social_number?: string | null;
    document_number?: string | null;
  } | null;
  nationality?: string | null;
  gender?: string | null;
  iban?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  avatar_url?: string | null;
  role?: string;
  properties?: string[];
  created_at?: string;
  updated_at?: string;
  full_name?: string; // Added missing property
}

export interface PropertyParticipant {
  id: string;
  property_id: string;
  user_id: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  created_at: string;
  updated_at: string;
  email?: string | null;
  documents_signed: string[] | null;
  webview_approved: boolean;
  user?: {
    id: string;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsapp_number?: string | null;
    avatar_url?: string | null;
    address?: string | null;
    city?: string | null;
    postal_code?: string | null;
    country?: string | null;
  };
  participant_profile?: ParticipantProfileData | null;
}

export interface ParticipantInvite {
  email: string;
  firstName: string;
  lastName: string;
  role: ParticipantRole;
  propertyId: string;
  temporaryPassword?: string;
}
