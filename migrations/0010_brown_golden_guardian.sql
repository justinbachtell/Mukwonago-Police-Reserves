ALTER TABLE "training" ADD COLUMN "min_participants" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "training" ADD COLUMN "max_participants" integer DEFAULT 10 NOT NULL;