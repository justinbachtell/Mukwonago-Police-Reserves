ALTER TABLE "uniform_sizes" DROP COLUMN "hat_size";--> statement-breakpoint
ALTER TABLE "public"."assigned_equipment" ALTER COLUMN "condition" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."condition";--> statement-breakpoint
CREATE TYPE "public"."condition" AS ENUM('new', 'good', 'fair', 'poor', 'damaged/broken');--> statement-breakpoint
ALTER TABLE "public"."assigned_equipment" ALTER COLUMN "condition" SET DATA TYPE "public"."condition" USING "condition"::"public"."condition";