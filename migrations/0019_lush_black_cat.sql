ALTER TABLE "assigned_equipment" ALTER COLUMN "checked_out_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "checked_out_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "checked_in_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "checked_in_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "expected_return_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "expected_return_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "purchase_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "purchase_date" SET DEFAULT now();