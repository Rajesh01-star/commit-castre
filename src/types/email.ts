import { Commit } from './github';

export interface EmailGenerationRequest {
  commits: Commit[];
  timeRange: {
    startDate: string;
    endDate: string;
  };
}

export interface EmailContent {
  subject: string;
  body: string;
}

export interface EmailGenerationResponse {
  email: EmailContent;
  error?: string;
}
