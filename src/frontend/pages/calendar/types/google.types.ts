// Google Calendar type definitions

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus?: string;
  }>;
  recurrence?: string[];
}

export interface GoogleOAuthResponse {
  access_token?: string;
  error?: string;
}

export interface GoogleOAuthError {
  type: string;
  message?: string;
}

export interface GoogleCalendarConfig {
  clientId: string;
  scopes: string;
  apiKey?: string;
}
