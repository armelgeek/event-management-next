import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid, integer, pgEnum, decimal } from 'drizzle-orm/pg-core';
import { users } from './auth';

// Enums for event status and request status
export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'active', 'closed', 'canceled']);
export const participationStatusEnum = pgEnum('participation_status', ['pending', 'accepted', 'rejected']);
export const eventTypeEnum = pgEnum('event_type', ['physical', 'online', 'hybrid']);

// Events table
export const events = pgTable('events', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  shortDescription: text('short_description'), // For event listings
  date: timestamp('date').notNull(),
  endDate: timestamp('end_date'), // Event end date
  location: text('location').notNull(),
  onlineUrl: text('online_url'), // For online/hybrid events
  category: text('category'),
  tags: text('tags'), // JSON array of tags
  maxParticipants: integer('max_participants'), // null for unlimited
  currentParticipants: integer('current_participants').notNull().default(0),
  organizerId: text('organizer_id')
    .notNull()
    .references(() => users.id),
  status: eventStatusEnum('status').notNull().default('draft'),
  eventType: eventTypeEnum('event_type').notNull().default('physical'),
  imageUrl: text('image_url'),
  bannerUrl: text('banner_url'), // Different from imageUrl for hero banners
  isPublic: boolean('is_public').notNull().default(true),
  requiresApproval: boolean('requires_approval').notNull().default(false), // Auto-approve participants
  allowGuestList: boolean('allow_guest_list').notNull().default(true),
  timezone: text('timezone').notNull().default('Europe/Paris'),
  currency: text('currency').notNull().default('EUR'),
  organizer: text('organizer'), // Organization name if different from user
  organizerEmail: text('organizer_email'),
  organizerPhone: text('organizer_phone'),
  website: text('website'),
  socialMedia: text('social_media'), // JSON object with social media links
  customFields: text('custom_fields'), // JSON for custom event fields
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  slug: text('slug').unique(), // URL-friendly event identifier
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

// Participation requests table (keeping existing structure)
export const participationRequests = pgTable('participation_requests', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: participationStatusEnum('status').notNull().default('pending'),
  message: text('message'), // Optional message from participant
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

// Messages table for communication (V1+)
export const messages = pgTable('messages', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  senderId: text('sender_id')
    .notNull()
    .references(() => users.id),
  recipientId: text('recipient_id')
    .notNull()
    .references(() => users.id),
  eventId: text('event_id')
    .references(() => events.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
});

// Event categories for better organization
export const eventCategories = pgTable('event_categories', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull().unique(),
  description: text('description'),
  color: text('color').default('#3B82F6'), // Hex color for UI
  icon: text('icon'), // Icon name for UI
  slug: text('slug').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});