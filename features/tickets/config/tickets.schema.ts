import { z } from 'zod';

// Ticket type schemas
export const createTicketTypeSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('EUR'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  maxPerPurchase: z.number().min(1, 'Max per purchase must be at least 1').max(100, 'Max 100 tickets per purchase').default(10),
  saleStartDate: z.string().datetime().optional(),
  saleEndDate: z.string().datetime().optional(),
  isRefundable: z.boolean().default(true),
  refundDeadline: z.string().datetime().optional(),
  sortOrder: z.number().default(0),
});

export const updateTicketTypeSchema = createTicketTypeSchema.partial().extend({
  id: z.string().uuid(),
});

export const deleteTicketTypeSchema = z.object({
  id: z.string().uuid(),
});

// Ticket purchase schemas
export const createTicketPurchaseSchema = z.object({
  ticketTypeId: z.string().uuid(),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Maximum 100 tickets per purchase'),
  attendeeInfo: z.array(z.object({
    name: z.string().min(1, 'Attendee name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    additionalInfo: z.record(z.any()).optional(), // For custom fields
  })),
});

export const updatePurchaseStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  refundAmount: z.number().min(0).optional(),
  refundReason: z.string().max(500).optional(),
});

// Order schemas
export const createOrderSchema = z.object({
  eventId: z.string().uuid(),
  ticketPurchases: z.array(createTicketPurchaseSchema),
  billingEmail: z.string().email('Valid billing email is required'),
  billingName: z.string().min(1, 'Billing name is required'),
  billingAddress: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().length(2, 'Country must be a 2-letter code'),
  }).optional(),
});

// Ticket validation schemas
export const validateTicketSchema = z.object({
  qrCode: z.string().min(1, 'QR code is required'),
  eventId: z.string().uuid(),
});

export const transferTicketSchema = z.object({
  ticketId: z.string().uuid(),
  newAttendeeEmail: z.string().email('Valid email is required'),
  newAttendeeName: z.string().min(1, 'Name is required'),
});

// Search and filter schemas
export const ticketFiltersSchema = z.object({
  eventId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Ticket analytics schemas
export const ticketAnalyticsSchema = z.object({
  eventId: z.string().uuid(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Refund request schema
export const requestRefundSchema = z.object({
  ticketPurchaseId: z.string().uuid(),
  reason: z.string().min(10, 'Please provide a reason for the refund').max(500, 'Reason must be less than 500 characters'),
  amount: z.number().min(0).optional(), // Partial refund amount
});

// Admin schemas
export const adminTicketActionSchema = z.object({
  ticketId: z.string().uuid(),
  action: z.enum(['void', 'reactivate', 'transfer', 'refund']),
  reason: z.string().max(500).optional(),
  newOwnerEmail: z.string().email().optional(), // For transfers
});

// Event ticket configuration schema
export const eventTicketConfigSchema = z.object({
  eventId: z.string().uuid(),
  ticketTypes: z.array(createTicketTypeSchema),
  saleStartDate: z.string().datetime().optional(),
  saleEndDate: z.string().datetime().optional(),
  maxTicketsPerPerson: z.number().min(1).max(100).default(10),
  requiresApproval: z.boolean().default(false),
  allowTransfers: z.boolean().default(true),
  refundPolicy: z.string().max(1000).optional(),
});