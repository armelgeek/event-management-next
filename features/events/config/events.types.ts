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
  eventTypeSchema,
  createEventCategorySchema,
  updateEventCategorySchema,
  eventAnalyticsFiltersSchema,
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
export type EventType = z.infer<typeof eventTypeSchema>;

// Category types
export type CreateEventCategoryInput = z.infer<typeof createEventCategorySchema>;
export type UpdateEventCategoryInput = z.infer<typeof updateEventCategorySchema>;

// Analytics types
export type EventAnalyticsFilters = z.infer<typeof eventAnalyticsFiltersSchema>;

// Database entity types (what we get from the database)
export interface Event {
  id: string;
  title: string;
  description: string | null;
  shortDescription: string | null;
  date: Date;
  endDate: Date | null;
  location: string;
  onlineUrl: string | null;
  category: string | null;
  tags: string | null; // JSON array
  maxParticipants: number | null;
  currentParticipants: number;
  organizerId: string;
  status: EventStatus;
  eventType: EventType;
  imageUrl: string | null;
  bannerUrl: string | null;
  isPublic: boolean;
  requiresApproval: boolean;
  allowGuestList: boolean;
  timezone: string;
  currency: string;
  organizerName: string | null; // Organization name if different from user
  organizerEmail: string | null;
  organizerPhone: string | null;
  website: string | null;
  socialMedia: string | null; // JSON object
  customFields: string | null; // JSON object
  seoTitle: string | null;
  seoDescription: string | null;
  slug: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  organizer?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  ticketTypes?: {
    id: string;
    name: string;
    price: string;
    quantity: number;
    sold: number;
    status: string;
  }[];
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

export interface EventCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  slug: string;
  isActive: boolean;
  sortOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
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

export interface EventCategoriesResponse {
  categories: EventCategory[];
  total: number;
}

// Social media structure for events
export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

// Custom field structure for events
export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[]; // For select fields
  placeholder?: string;
}

// Event with pricing info for listings
export interface EventWithPricing extends Event {
  minPrice: number;
  maxPrice: number;
  hasTickets: boolean;
  availableTickets: number;
}