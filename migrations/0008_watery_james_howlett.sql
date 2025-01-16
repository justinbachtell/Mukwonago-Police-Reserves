ALTER TABLE "events" ADD COLUMN "last_reminder_sent" timestamp;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "last_reminder_sent" timestamp;--> statement-breakpoint
ALTER TABLE "training" ADD COLUMN "last_reminder_sent" timestamp;--> statement-breakpoint
ALTER TABLE "public"."notifications" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."notification_type";--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM(
  'application_submitted',
  'application_approved',
  'application_rejected',
  'event_created',
  'event_updated',
  'event_signup',
  'event_signup_reminder',
  'training_created',
  'training_updated',
  'training_signup',
  'training_signup_reminder',
  'equipment_assigned',
  'equipment_returned',
  'equipment_return_reminder',
  'policy_created',
  'policy_updated',
  'policy_reminder',
  'event_reminder',
  'training_reminder',
  'general',
  'announcement'
);--> statement-breakpoint
ALTER TABLE "public"."notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";