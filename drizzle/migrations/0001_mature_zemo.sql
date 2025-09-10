CREATE TYPE "public"."event_type" AS ENUM('physical', 'online', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('active', 'sold_out', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."ticket_type" AS ENUM('free', 'paid', 'early_bird', 'vip', 'group');--> statement-breakpoint
ALTER TYPE "public"."event_status" ADD VALUE 'draft' BEFORE 'active';--> statement-breakpoint
ALTER TYPE "public"."event_status" ADD VALUE 'published' BEFORE 'active';--> statement-breakpoint
CREATE TABLE "event_categories" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#3B82F6',
	"icon" text,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "event_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_analytics" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"tickets_sold" integer DEFAULT 0 NOT NULL,
	"revenue" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"refunds" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"attendance_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"event_id" text NOT NULL,
	"order_number" text NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"payment_intent_id" text,
	"payment_method" text,
	"billing_email" text NOT NULL,
	"billing_name" text NOT NULL,
	"billing_address" text,
	"receipt_url" text,
	"refund_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "ticket_purchases" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_type_id" text NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"payment_intent_id" text,
	"refund_amount" numeric(10, 2),
	"refund_reason" text,
	"attendee_info" text,
	"qr_code" text,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_types" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"quantity" integer NOT NULL,
	"sold" integer DEFAULT 0 NOT NULL,
	"max_per_purchase" integer DEFAULT 10,
	"sale_start_date" timestamp,
	"sale_end_date" timestamp,
	"status" "ticket_status" DEFAULT 'active' NOT NULL,
	"is_refundable" boolean DEFAULT true NOT NULL,
	"refund_deadline" timestamp,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"ticket_purchase_id" text NOT NULL,
	"ticket_type_id" text NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"ticket_number" text NOT NULL,
	"qr_code" text NOT NULL,
	"attendee_name" text NOT NULL,
	"attendee_email" text NOT NULL,
	"is_transferable" boolean DEFAULT true NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"scanned_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number"),
	CONSTRAINT "tickets_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "max_participants" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "short_description" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "online_url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "event_type" "event_type" DEFAULT 'physical' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_public" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "requires_approval" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "allow_guest_list" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "timezone" text DEFAULT 'Europe/Paris' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "currency" text DEFAULT 'EUR' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "organizer" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "organizer_email" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "organizer_phone" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "social_media" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "custom_fields" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "event_analytics" ADD CONSTRAINT "event_analytics_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_purchase_id_ticket_purchases_id_fk" FOREIGN KEY ("ticket_purchase_id") REFERENCES "public"."ticket_purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_slug_unique" UNIQUE("slug");