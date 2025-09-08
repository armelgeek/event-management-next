import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid, integer, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './auth';

// Enums for event status and request status
export const eventStatusEnum = pgEnum('event_status', ['active', 'closed', 'canceled']);
export const participationStatusEnum = pgEnum('participation_status', ['pending', 'accepted', 'rejected']);

// Events table
export const events = pgTable('events', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  location: text('location').notNull(),
  category: text('category'),
  maxParticipants: integer('max_participants').notNull(),
  currentParticipants: integer('current_participants').notNull().default(0),
  organizerId: text('organizer_id')
    .notNull()
    .references(() => users.id),
  status: eventStatusEnum('status').notNull().default('active'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
});

// Participation requests table
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

// Optional: Messages table for communication (V1+)
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