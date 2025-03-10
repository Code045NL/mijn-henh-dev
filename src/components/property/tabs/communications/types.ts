
export interface Submission {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  inquiry_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  agent_id?: string;
  agent?: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
  };
  replies?: SubmissionReply[];
}

export interface SubmissionReply {
  id: string;
  text: string;
  created_at: string;
  agent_id: string;
}

export interface SubmissionDetailProps {
  submission: Submission;
  onMarkAsRead: () => Promise<void>;
  isMarking: boolean;
  onSendReply: (text: string) => Promise<void>;
  isSending: boolean;
}
