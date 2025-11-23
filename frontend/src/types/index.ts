// Domain types for Wakai mediation assistant

export interface MediationCase {
  id: string;
  participantName: string;
  participantName2?: string; // Second participant for family cases
  rut: string; // Chilean RUT (national ID)
  rut2?: string; // Second participant RUT
  relationshipType?: 'parents' | 'caregivers' | 'guardians' | 'other';
  mediationType?: 'visitation' | 'communication' | 'childcare' | 'coexistence' | 'other';
  mediationDate: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  description: string;
  emotionalStatus?: 'cooperative' | 'neutral' | 'unsure' | 'resistant';
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactAttempt {
  id: string;
  caseId: string;
  channel: 'whatsapp' | 'phone' | 'email' | 'in-person' | 'telegram';
  date: Date;
  result: 'successful' | 'no-answer' | 'declined' | 'scheduled' | 'positive-disposition' | 'refused';
  notes: string;
  participantName?: string; // Which participant was contacted
}

export interface EmotionalStatus {
  id: string;
  caseId: string;
  participantName: string;
  indicator: 'cooperative' | 'neutral' | 'unsure' | 'resistant';
  notes: string;
  assessedAt: Date;
}

// Helper type for status badge colors
export type StatusColor = 'green' | 'yellow' | 'gray' | 'red';

// Case Report interface
export interface CaseReport {
  caseId: string;
  summary: {
    parties: string[];
    context: string;
    upcomingDate: Date;
    emotionalStatus: 'cooperative' | 'neutral' | 'unsure' | 'resistant';
  };
  contactSummary: {
    whatsapp: { total: number; positive: number; negative: number };
    phone: { total: number; positive: number; negative: number };
    email: { total: number; positive: number; negative: number };
  };
  insights: string[];
}
