CREATE TYPE "public"."equipment_category" AS ENUM('uniform', 'gear', 'communication', 'safety', 'other');--> statement-breakpoint
CREATE TYPE "public"."condition" AS ENUM('new', 'excellent', 'good', 'fair', 'poor', 'unusable');--> statement-breakpoint
ALTER TYPE "public"."availability" ADD VALUE 'flexible';--> statement-breakpoint
CREATE TABLE "emergency_contact" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"relationship" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "equipment_category" NOT NULL,
	"serial_number" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"available_quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "equipment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "equipment_assignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"equipment_id" integer NOT NULL,
	"condition" "condition" NOT NULL,
	"checked_out_at" timestamp NOT NULL,
	"checked_in_at" timestamp,
	"expected_return_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "equipment_assignment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "uniform_sizes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"shirt_size" varchar(10) NOT NULL,
	"pant_size" varchar(10) NOT NULL,
	"shoe_size" varchar(10) NOT NULL,
	"hat_size" varchar(10),
	"notes" text,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "uniform_sizes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "emergency_contact" ADD CONSTRAINT "emergency_contact_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_assignment" ADD CONSTRAINT "equipment_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_assignment" ADD CONSTRAINT "equipment_assignment_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uniform_sizes" ADD CONSTRAINT "uniform_sizes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public"."application" ALTER COLUMN "prior_experience" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."prior_experience";--> statement-breakpoint
CREATE TYPE "public"."prior_experience" AS ENUM('none', 'less_than_1_year', '1_to_3_years', 'more_than_3_years');--> statement-breakpoint
ALTER TABLE "public"."application" ALTER COLUMN "prior_experience" SET DATA TYPE "public"."prior_experience" USING "prior_experience"::"public"."prior_experience";