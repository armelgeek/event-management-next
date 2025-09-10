import { z } from 'zod';
import {
  createTicketTypeSchema,
  updateTicketTypeSchema,
  deleteTicketTypeSchema,
  createTicketPurchaseSchema,
  updatePurchaseStatusSchema,
  createOrderSchema,
  validateTicketSchema,
  transferTicketSchema,
  ticketFiltersSchema,
  ticketAnalyticsSchema,
  requestRefundSchema,
  adminTicketActionSchema,
  eventTicketConfigSchema,
} from './tickets.schema';

// Ticket type types
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
export type DeleteTicketTypeInput = z.infer<typeof deleteTicketTypeSchema>;

// Ticket purchase types
export type CreateTicketPurchaseInput = z.infer<typeof createTicketPurchaseSchema>;
export type UpdatePurchaseStatusInput = z.infer<typeof updatePurchaseStatusSchema>;

// Order types
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Validation and transfer types
export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;
export type TransferTicketInput = z.infer<typeof transferTicketSchema>;

// Filter and analytics types
export type TicketFilters = z.infer<typeof ticketFiltersSchema>;
export type TicketAnalyticsInput = z.infer<typeof ticketAnalyticsSchema>;

// Refund and admin types
export type RequestRefundInput = z.infer<typeof requestRefundSchema>;
export type AdminTicketActionInput = z.infer<typeof adminTicketActionSchema>;
export type EventTicketConfigInput = z.infer<typeof eventTicketConfigSchema>;

// Database entity types
export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: string; // Decimal as string
  currency: string;
  quantity: number;
  sold: number;
  maxPerPurchase: number | null;
  saleStartDate: Date | null;
  saleEndDate: Date | null;
  status: 'active' | 'sold_out' | 'disabled';
  isRefundable: boolean;
  refundDeadline: Date | null;
  sortOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
  event?: {
    id: string;
    title: string;
    date: Date;
    location: string;
  };
}

export interface TicketPurchase {
  id: string;
  ticketTypeId: string;
  eventId: string;
  userId: string;
  quantity: number;
  unitPrice: string; // Decimal as string
  totalPrice: string; // Decimal as string
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId: string | null;
  refundAmount: string | null; // Decimal as string
  refundReason: string | null;
  attendeeInfo: string | null; // JSON string
  qrCode: string | null;
  isUsed: boolean;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  ticketType?: TicketType;
  event?: {
    id: string;
    title: string;
    date: Date;
    location: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  orderNumber: string;
  totalAmount: string; // Decimal as string
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId: string | null;
  paymentMethod: string | null;
  billingEmail: string;
  billingName: string;
  billingAddress: string | null; // JSON string
  receiptUrl: string | null;
  refundAmount: string | null; // Decimal as string
  createdAt: Date;
  updatedAt: Date;
  event?: {
    id: string;
    title: string;
    date: Date;
    location: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  purchases?: TicketPurchase[];
  tickets?: Ticket[];
}

export interface Ticket {
  id: string;
  orderId: string;
  ticketPurchaseId: string;
  ticketTypeId: string;
  eventId: string;
  userId: string;
  ticketNumber: string;
  qrCode: string;
  attendeeName: string;
  attendeeEmail: string;
  isTransferable: boolean;
  isUsed: boolean;
  usedAt: Date | null;
  scannedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  order?: Order;
  ticketType?: TicketType;
  event?: {
    id: string;
    title: string;
    date: Date;
    location: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EventAnalytics {
  id: string;
  eventId: string;
  date: Date;
  views: number;
  ticketsSold: number;
  revenue: string; // Decimal as string
  refunds: string; // Decimal as string
  attendanceRate: string | null; // Decimal as string
  createdAt: Date;
  event?: {
    id: string;
    title: string;
    date: Date;
  };
}

// Response types for APIs
export interface TicketTypesResponse {
  ticketTypes: TicketType[];
  total: number;
}

export interface TicketPurchasesResponse {
  purchases: TicketPurchase[];
  total: number;
  page: number;
  totalPages: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TicketAnalyticsResponse {
  analytics: EventAnalytics[];
  summary: {
    totalRevenue: string;
    totalTicketsSold: number;
    totalRefunds: string;
    averageTicketPrice: string;
    conversionRate: string;
  };
}

// Attendee info structure for JSON fields
export interface AttendeeInfo {
  name: string;
  email: string;
  phone?: string;
  additionalInfo?: Record<string, any>;
}

// Billing address structure for JSON fields
export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

// Social media structure for events
export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
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

// Enums
export type TicketTypeStatus = 'active' | 'sold_out' | 'disabled';
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type TicketActionType = 'void' | 'reactivate' | 'transfer' | 'refund';