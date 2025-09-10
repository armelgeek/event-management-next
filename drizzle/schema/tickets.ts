import { sql } from 'drizzle-orm';
import { boolean, decimal, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { events } from './events';
import { users } from './auth';

// Enums for ticket types and status
export const ticketTypeEnum = pgEnum('ticket_type', ['free', 'paid', 'early_bird', 'vip', 'group']);
export const ticketStatusEnum = pgEnum('ticket_status', ['active', 'sold_out', 'disabled']);
export const purchaseStatusEnum = pgEnum('purchase_status', ['pending', 'completed', 'failed', 'refunded']);

// Ticket types table - defines different ticket options for an event
export const ticketTypes = pgTable('ticket_types', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Early Bird", "VIP", "General Admission"
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  currency: text('currency').notNull().default('EUR'),
  quantity: integer('quantity').notNull(), // Total tickets available
  sold: integer('sold').notNull().default(0), // Tickets sold
  maxPerPurchase: integer('max_per_purchase').default(10), // Max tickets per purchase
  saleStartDate: timestamp('sale_start_date'),
  saleEndDate: timestamp('sale_end_date'),
  status: ticketStatusEnum('status').notNull().default('active'),
  isRefundable: boolean('is_refundable').notNull().default(true),
  refundDeadline: timestamp('refund_deadline'), // Deadline for refunds
  sortOrder: integer('sort_order').default(0), // Display order
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

// Ticket purchases table - individual ticket purchase records
export const ticketPurchases = pgTable('ticket_purchases', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ticketTypeId: text('ticket_type_id')
    .notNull()
    .references(() => ticketTypes.id, { onDelete: 'cascade' }),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('EUR'),
  status: purchaseStatusEnum('status').notNull().default('pending'),
  paymentIntentId: text('payment_intent_id'), // Stripe payment intent ID
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  refundReason: text('refund_reason'),
  attendeeInfo: text('attendee_info'), // JSON string with attendee details
  qrCode: text('qr_code'), // Unique QR code for ticket validation
  isUsed: boolean('is_used').notNull().default(false), // Whether ticket was used (scanned)
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

// Order table - groups multiple ticket purchases together
export const orders = pgTable('orders', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  orderNumber: text('order_number').notNull().unique(), // Human-readable order number
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('EUR'),
  status: purchaseStatusEnum('status').notNull().default('pending'),
  paymentIntentId: text('payment_intent_id'), // Stripe payment intent ID
  paymentMethod: text('payment_method'), // card, paypal, etc.
  billingEmail: text('billing_email').notNull(),
  billingName: text('billing_name').notNull(),
  billingAddress: text('billing_address'), // JSON string with address details
  receiptUrl: text('receipt_url'), // URL to payment receipt
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

// Tickets table - individual tickets issued from purchases
export const tickets = pgTable('tickets', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  ticketPurchaseId: text('ticket_purchase_id')
    .notNull()
    .references(() => ticketPurchases.id, { onDelete: 'cascade' }),
  ticketTypeId: text('ticket_type_id')
    .notNull()
    .references(() => ticketTypes.id, { onDelete: 'cascade' }),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ticketNumber: text('ticket_number').notNull().unique(), // Human-readable ticket number
  qrCode: text('qr_code').notNull().unique(), // Unique QR code for validation
  attendeeName: text('attendee_name').notNull(),
  attendeeEmail: text('attendee_email').notNull(),
  isTransferable: boolean('is_transferable').notNull().default(true),
  isUsed: boolean('is_used').notNull().default(false),
  usedAt: timestamp('used_at'),
  scannedBy: text('scanned_by'), // User ID who scanned the ticket
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

// Event analytics table for tracking metrics
export const eventAnalytics = pgTable('event_analytics', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull().default(sql`now()`),
  views: integer('views').notNull().default(0),
  ticketsSold: integer('tickets_sold').notNull().default(0),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).notNull().default('0.00'),
  refunds: decimal('refunds', { precision: 10, scale: 2 }).notNull().default('0.00'),
  attendanceRate: decimal('attendance_rate', { precision: 5, scale: 2 }), // Percentage
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
});