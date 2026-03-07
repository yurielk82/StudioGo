CREATE TYPE "public"."tier" AS ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('MEMBER', 'OPERATOR', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('PENDING', 'APPROVED', 'SUSPENDED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."time_slot_status" AS ENUM('AVAILABLE', 'RESERVED', 'IN_USE', 'CLEANING', 'BLOCKED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."notification_event_type" AS ENUM('MEMBER_REGISTERED', 'MEMBER_APPROVED', 'MEMBER_REJECTED', 'RESERVATION_REQUESTED', 'RESERVATION_APPROVED', 'RESERVATION_REJECTED', 'RESERVATION_CANCELLED_BY_MEMBER', 'RESERVATION_CANCELLED_BY_OPERATOR', 'BROADCAST_REMINDER', 'BROADCAST_START', 'BROADCAST_END', 'CLEANING_COMPLETE', 'TIER_UPGRADED', 'TIER_DOWNGRADED', 'NO_SHOW', 'SCHEDULE_CHANGED', 'STUDIO_BLOCKED', 'DAILY_SUMMARY', 'WEEKLY_REPORT');--> statement-breakpoint
CREATE TYPE "public"."notification_log_status" AS ENUM('PENDING', 'SENT', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."broadcast_status" AS ENUM('COMPLETED', 'NO_SHOW', 'EARLY_END');--> statement-breakpoint
CREATE TYPE "public"."tier_change_reason" AS ENUM('SYSTEM', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."slot_hold_status" AS ENUM('ACTIVE', 'EXPIRED', 'CONSUMED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."blackout_type" AS ENUM('HOLIDAY', 'MAINTENANCE', 'MANUAL', 'EVENT');--> statement-breakpoint
CREATE TYPE "public"."notification_job_status" AS ENUM('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('ACTIVE', 'NOTIFIED', 'FULFILLED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."checkin_method" AS ENUM('QR', 'PIN', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('PENDING', 'PACKING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."settlement_status" AS ENUM('PENDING', 'CONFIRMED', 'SETTLED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."announcement_type" AS ENUM('BANNER', 'NOTICE', 'POPUP');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kakao_id" varchar(50) NOT NULL,
	"email" varchar(255),
	"name" varchar(50),
	"nickname" varchar(50),
	"phone" varchar(20),
	"profile_image" text,
	"bank_name" varchar(30),
	"account_number" varchar(50),
	"account_holder" varchar(30),
	"tier" "tier" DEFAULT 'BRONZE' NOT NULL,
	"role" "user_role" DEFAULT 'MEMBER' NOT NULL,
	"status" "user_status" DEFAULT 'PENDING' NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"memo" text,
	"nickname_normalized" varchar(50),
	"phone_normalized" varchar(20),
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_kakao_id_unique" UNIQUE("kakao_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "operator_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"can_approve_reservation" boolean DEFAULT false NOT NULL,
	"can_reject_reservation" boolean DEFAULT false NOT NULL,
	"can_manage_members" boolean DEFAULT false NOT NULL,
	"can_approve_member" boolean DEFAULT false NOT NULL,
	"can_manage_studios" boolean DEFAULT false NOT NULL,
	"can_view_statistics" boolean DEFAULT false NOT NULL,
	"can_send_notification" boolean DEFAULT false NOT NULL,
	"can_manage_services" boolean DEFAULT false NOT NULL,
	"granted_by" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "operator_permissions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "studios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"capacity" integer NOT NULL,
	"equipment" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capacity_positive" CHECK ("studios"."capacity" > 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "operation_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"category" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "time_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"date" date NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"cleaning_end_time" varchar(5),
	"status" time_slot_status DEFAULT 'AVAILABLE' NOT NULL,
	"blocked_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "time_valid" CHECK ("time_slots"."start_time" < "time_slots"."end_time")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_number" varchar(20) NOT NULL,
	"user_id" uuid NOT NULL,
	"studio_id" uuid NOT NULL,
	"time_slot_id" uuid NOT NULL,
	"date" date NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"status" "reservation_status" DEFAULT 'PENDING' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"rejected_reason" text,
	"cancelled_at" timestamp with time zone,
	"cancelled_reason" text,
	"completed_at" timestamp with time zone,
	"memo" text,
	"operator_memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_reservation_number_unique" UNIQUE("reservation_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reservation_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "additional_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"requires_quantity" boolean DEFAULT false NOT NULL,
	"requires_memo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" "notification_event_type" NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"send_to_member" boolean DEFAULT true NOT NULL,
	"send_to_operator" boolean DEFAULT false NOT NULL,
	"template_code" varchar(50),
	"template_content" text,
	"timing" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_setting_id" uuid,
	"recipient_id" uuid,
	"recipient_phone" varchar(20),
	"event_type" "notification_event_type" NOT NULL,
	"template_code" varchar(50),
	"content" text,
	"status" "notification_log_status" DEFAULT 'PENDING' NOT NULL,
	"sent_at" timestamp with time zone,
	"failed_reason" text,
	"related_reservation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "broadcast_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"studio_id" uuid NOT NULL,
	"date" date NOT NULL,
	"actual_start_time" timestamp with time zone,
	"actual_end_time" timestamp with time zone,
	"duration_minutes" integer,
	"status" "broadcast_status" NOT NULL,
	"rating" integer,
	"operator_note" text,
	"services_used" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "broadcast_history_reservation_id_unique" UNIQUE("reservation_id"),
	CONSTRAINT "rating_range" CHECK ("broadcast_history"."rating" IS NULL OR ("broadcast_history"."rating" >= 1 AND "broadcast_history"."rating" <= 5))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tier_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"previous_tier" "tier" NOT NULL,
	"new_tier" "tier" NOT NULL,
	"reason" "tier_change_reason" NOT NULL,
	"changed_by" uuid,
	"broadcast_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"target" varchar(100) NOT NULL,
	"target_id" varchar(100),
	"details" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "slot_holds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"time_slot_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"hold_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" "slot_hold_status" DEFAULT 'ACTIVE' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reservation_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"from_status" "reservation_status",
	"to_status" "reservation_status" NOT NULL,
	"reason" text,
	"changed_by_user_id" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "studio_blackouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"reason" text NOT NULL,
	"type" "blackout_type" NOT NULL,
	"repeat_rule" jsonb,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" varchar(255) NOT NULL,
	"device_name" varchar(100),
	"platform" varchar(20),
	"ip_address" varchar(45),
	"user_agent" text,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" "notification_event_type" NOT NULL,
	"status" "notification_job_status" DEFAULT 'PENDING' NOT NULL,
	"payload" jsonb NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"idempotency_key" varchar(255) NOT NULL,
	"related_reservation_id" uuid,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"data" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" varchar(20) NOT NULL,
	"token" varchar(500) NOT NULL,
	"device_id" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reservation_waitlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"studio_id" uuid,
	"date" date NOT NULL,
	"preferred_time_range" jsonb,
	"status" "waitlist_status" DEFAULT 'ACTIVE' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"notified_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"operator_id" uuid,
	"method" "checkin_method" NOT NULL,
	"pin_code" varchar(10),
	"checked_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	"checked_out_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checkins_reservation_id_unique" UNIQUE("reservation_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fulfillment_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"status" "fulfillment_status" DEFAULT 'PENDING' NOT NULL,
	"courier" varchar(50),
	"tracking_number" varchar(50),
	"parcel_count" integer,
	"operator_id" uuid,
	"memo" text,
	"shipped_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reservation_id" uuid,
	"amount" integer DEFAULT 0 NOT NULL,
	"service_amount" integer DEFAULT 0 NOT NULL,
	"penalty_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"status" "settlement_status" DEFAULT 'PENDING' NOT NULL,
	"settled_at" timestamp with time zone,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"type" "announcement_type" NOT NULL,
	"target_roles" jsonb DEFAULT '["MEMBER"]'::jsonb NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"path" text NOT NULL,
	"provider" varchar(20) NOT NULL,
	"type" varchar(20) NOT NULL,
	"mime_type" varchar(100),
	"size" integer,
	"uploaded_by" uuid,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"description" text,
	"scope" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "operator_permissions" ADD CONSTRAINT "operator_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "operator_permissions" ADD CONSTRAINT "operator_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservations" ADD CONSTRAINT "reservations_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservations" ADD CONSTRAINT "reservations_time_slot_id_time_slots_id_fk" FOREIGN KEY ("time_slot_id") REFERENCES "public"."time_slots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservations" ADD CONSTRAINT "reservations_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservation_services" ADD CONSTRAINT "reservation_services_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservation_services" ADD CONSTRAINT "reservation_services_service_id_additional_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."additional_services"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_notification_setting_id_notification_settings_id_fk" FOREIGN KEY ("notification_setting_id") REFERENCES "public"."notification_settings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_related_reservation_id_reservations_id_fk" FOREIGN KEY ("related_reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcast_history" ADD CONSTRAINT "broadcast_history_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcast_history" ADD CONSTRAINT "broadcast_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcast_history" ADD CONSTRAINT "broadcast_history_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tier_history" ADD CONSTRAINT "tier_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tier_history" ADD CONSTRAINT "tier_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "slot_holds" ADD CONSTRAINT "slot_holds_time_slot_id_time_slots_id_fk" FOREIGN KEY ("time_slot_id") REFERENCES "public"."time_slots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "slot_holds" ADD CONSTRAINT "slot_holds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservation_status_history" ADD CONSTRAINT "reservation_status_history_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservation_status_history" ADD CONSTRAINT "reservation_status_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studio_blackouts" ADD CONSTRAINT "studio_blackouts_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studio_blackouts" ADD CONSTRAINT "studio_blackouts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_jobs" ADD CONSTRAINT "notification_jobs_related_reservation_id_reservations_id_fk" FOREIGN KEY ("related_reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app_notifications" ADD CONSTRAINT "app_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservation_waitlists" ADD CONSTRAINT "reservation_waitlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reservation_waitlists" ADD CONSTRAINT "reservation_waitlists_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkins" ADD CONSTRAINT "checkins_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkins" ADD CONSTRAINT "checkins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkins" ADD CONSTRAINT "checkins_operator_id_users_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fulfillment_tasks" ADD CONSTRAINT "fulfillment_tasks_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fulfillment_tasks" ADD CONSTRAINT "fulfillment_tasks_operator_id_users_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "settlements" ADD CONSTRAINT "settlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "settlements" ADD CONSTRAINT "settlements_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assets" ADD CONSTRAINT "assets_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_kakao_id_idx" ON "users" USING btree ("kakao_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_nickname_normalized_idx" ON "users" USING btree ("nickname_normalized");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "operation_settings_key_idx" ON "operation_settings" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "time_slots_studio_date_start_idx" ON "time_slots" USING btree ("studio_id","date","start_time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "time_slots_studio_date_idx" ON "time_slots" USING btree ("studio_id","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "time_slots_date_status_idx" ON "time_slots" USING btree ("date","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservations_date_studio_idx" ON "reservations" USING btree ("date","studio_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservations_user_date_idx" ON "reservations" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservations_status_idx" ON "reservations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_settings_event_type_idx" ON "notification_settings" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_logs_recipient_created_idx" ON "notification_logs" USING btree ("recipient_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "broadcast_history_user_date_idx" ON "broadcast_history" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_logs_user_idx" ON "system_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_logs_action_idx" ON "system_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_logs_created_idx" ON "system_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "slot_holds_token_idx" ON "slot_holds" USING btree ("hold_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "slot_holds_slot_status_idx" ON "slot_holds" USING btree ("time_slot_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "studio_blackouts_studio_range_idx" ON "studio_blackouts" USING btree ("studio_id","start_at","end_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "daily_counters_key_idx" ON "daily_counters" USING btree ("key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_sessions_user_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_jobs_status_scheduled_idx" ON "notification_jobs" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_jobs_idempotency_idx" ON "notification_jobs" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "app_notifications_user_read_idx" ON "app_notifications" USING btree ("user_id","is_read","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "push_tokens_token_idx" ON "push_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservation_waitlists_date_status_idx" ON "reservation_waitlists" USING btree ("date","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fulfillment_tasks_status_created_idx" ON "fulfillment_tasks" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "settlements_status_created_idx" ON "settlements" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "feature_flags_key_idx" ON "feature_flags" USING btree ("key");