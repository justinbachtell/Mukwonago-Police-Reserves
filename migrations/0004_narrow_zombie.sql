CREATE TYPE "public"."completion_status" AS ENUM('completed', 'incomplete', 'excused', 'unexcused');--> statement-breakpoint
ALTER TABLE "event_assignments" ADD COLUMN "completion_status" "completion_status";--> statement-breakpoint
ALTER TABLE "event_assignments" ADD COLUMN "completion_notes" text;--> statement-breakpoint
ALTER TABLE "training_assignments" ADD COLUMN "completion_status" "completion_status";--> statement-breakpoint
ALTER TABLE "training_assignments" ADD COLUMN "completion_notes" text;