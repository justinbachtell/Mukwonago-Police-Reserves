ALTER TABLE "application" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "checked_out_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "checked_in_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "expected_return_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "emergency_contact" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "emergency_contact" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "purchase_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "uniform_sizes" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "uniform_sizes" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ADD COLUMN "returned_at" timestamp;