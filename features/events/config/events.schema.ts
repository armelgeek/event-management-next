import { z } from 'zod';

// Base event schema
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required').max(200, 'Location must be less than 200 characters'),
  category: z.string().min(1, 'Category is required'),
  maxParticipants: z.number().min(1, 'Must allow at least 1 participant').max(10000, 'Maximum 10,000 participants'),
  imageUrl: z.string().url().optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().uuid(),
});

export const deleteEventSchema = z.object({
  id: z.string().uuid(),
});

// Participation request schemas
export const createParticipationRequestSchema = z.object({
  eventId: z.string().uuid(),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

export const updateParticipationRequestSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'accepted', 'rejected']),
});

// Event filtering and search schemas
export const eventFiltersSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Event status schema
export const eventStatusSchema = z.enum(['active', 'closed', 'canceled']);
export const participationStatusSchema = z.enum(['pending', 'accepted', 'rejected']);