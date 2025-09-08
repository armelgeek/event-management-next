import { z } from 'zod';
import {
  createEventSchema,
  updateEventSchema,
  deleteEventSchema,
  createParticipationRequestSchema,
  updateParticipationRequestSchema,
  eventFiltersSchema,
  eventStatusSchema,
  participationStatusSchema,
} from './events.schema';

// Event types
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;

// Participation request types
export type CreateParticipationRequestInput = z.infer<typeof createParticipationRequestSchema>;
export type UpdateParticipationRequestInput = z.infer<typeof updateParticipationRequestSchema>;

// Filter and status types
export type EventFilters = z.infer<typeof eventFiltersSchema>;
export type EventStatus = z.infer<typeof eventStatusSchema>;
export type ParticipationStatus = z.infer<typeof participationStatusSchema>;

// Database entity types (what we get from the database)
export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  location: string;
  category: string | null;
  maxParticipants: number;
  currentParticipants: number;
  organizerId: string;
  status: EventStatus;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizer?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface ParticipationRequest {
  id: string;
  eventId: string;
  userId: string;
  status: ParticipationStatus;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
  event?: Event;
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

// Response types for APIs
export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ParticipationRequestsResponse {
  requests: ParticipationRequest[];
  total: number;
  page: number;
  totalPages: number;
}