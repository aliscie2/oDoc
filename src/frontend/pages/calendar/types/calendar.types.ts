// Calendar type definitions

import { Event } from './event.types';
import { Availability } from './availability.types';

export interface Calendar {
  id: string;
  owner: string;
  events: Event[];
  availabilities: Availability[];
  google_ids: string[];
  google_public_urls?: string[];
}

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarState {
  calendar: Calendar | null;
  google_events: Event[];
  owner_google_events?: Event[];
  calendar_actions: CalendarAction[];
  calendarChanged: boolean;
  user_calendar?: Calendar | null;
}

export interface CalendarAction {
  type: 'ADD_EVENT' | 'UPDATE_EVENT' | 'DELETE_EVENT' | 'SET_AVAILABILITY';
  payload: any;
  timestamp: number;
}
