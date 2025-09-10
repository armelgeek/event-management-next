import { z } from 'zod';

// Base event schema - updated for enhanced event management
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  shortDescription: z.string().max(200, 'Short description must be less than 200 characters').optional(),
  date: z.string().min(1, 'Date is required'),
  endDate: z.string().optional(),
  location: z.string().min(1, 'Location is required').max(200, 'Location must be less than 200 characters'),
  onlineUrl: z.string().url('Must be a valid URL').optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  maxParticipants: z.number().min(1, 'Must allow at least 1 participant').max(10000, 'Maximum 10,000 participants').optional(),
  eventType: z.enum(['physical', 'online', 'hybrid']).default('physical'),
  imageUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  isPublic: z.boolean().default(true),
  requiresApproval: z.boolean().default(false),
  allowGuestList: z.boolean().default(true),
  timezone: z.string().default('Europe/Paris'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('EUR'),
  organizer: z.string().optional(),
  organizerEmail: z.string().email().optional(),
  organizerPhone: z.string().optional(),
  website: z.string().url().optional(),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }).optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  // Ticket configuration
  ticketTypes: z.array(z.object({
    name: z.string().min(1, 'Ticket name is required'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be non-negative'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    maxPerPurchase: z.number().min(1).max(100).default(10),
    saleStartDate: z.string().datetime().optional(),
    saleEndDate: z.string().datetime().optional(),
    isRefundable: z.boolean().default(true),
    refundDeadline: z.string().datetime().optional(),
  })).optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().uuid(),
});

export const deleteEventSchema = z.object({
  id: z.string().uuid(),
});

// Participation request schemas (keeping existing)
export const createParticipationRequestSchema = z.object({
  eventId: z.string().uuid(),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

export const updateParticipationRequestSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'accepted', 'rejected']),
});

// Event filtering and search schemas - enhanced
export const eventFiltersSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  eventType: z.enum(['physical', 'online', 'hybrid']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'active', 'closed', 'canceled']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Event status schemas - updated
export const eventStatusSchema = z.enum(['draft', 'published', 'active', 'closed', 'canceled']);
export const participationStatusSchema = z.enum(['pending', 'accepted', 'rejected']);
export const eventTypeSchema = z.enum(['physical', 'online', 'hybrid']);

// Event category schema
export const createEventCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').default('#3B82F6'),
  icon: z.string().optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export const updateEventCategorySchema = createEventCategorySchema.partial().extend({
  id: z.string().uuid(),
});

// Event analytics schema
export const eventAnalyticsFiltersSchema = z.object({
  eventId: z.string().uuid(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
});