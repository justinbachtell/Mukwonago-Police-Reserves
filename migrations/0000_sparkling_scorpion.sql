CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."availability" AS ENUM('weekdays', 'weekends', 'both', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."equipment_category" AS ENUM('uniform', 'gear', 'communication', 'safety', 'other');--> statement-breakpoint
CREATE TYPE "public"."equipment_condition" AS ENUM('new', 'good', 'fair', 'poor', 'damaged/broken');--> statement-breakpoint
CREATE TYPE "public"."position" AS ENUM('officer', 'reserve', 'admin', 'staff');--> statement-breakpoint
CREATE TYPE "public"."prior_experience" AS ENUM('none', 'less_than_1_year', '1_to_3_years', 'more_than_3_years');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'member', 'guest');--> statement-breakpoint
CREATE TABLE "application" (
	"availability" "availability" NOT NULL,
	"city" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"driver_license" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"position" "position" DEFAULT 'reserve' NOT NULL,
	"prior_experience" "prior_experience" NOT NULL,
	"resume" text,
	"state" text NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"street_address" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL,
	"zip_code" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "assigned_equipment" (
	"checked_in_at" timestamp,
	"checked_out_at" timestamp with time zone DEFAULT now() NOT NULL,
	"condition" "equipment_condition" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"equipment_id" integer NOT NULL,
	"expected_return_date" timestamp,
	"id" serial PRIMARY KEY NOT NULL,
	"notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assigned_equipment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "emergency_contact" (
	"city" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text,
	"first_name" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"relationship" text NOT NULL,
	"state" text,
	"street_address" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL,
	"zip_code" text
);
--> statement-breakpoint
ALTER TABLE "emergency_contact" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "equipment" (
	"assigned_to" integer,
	"created_at" timestamp with time zone NOT NULL,
	"description" text,
	"id" serial PRIMARY KEY NOT NULL,
	"is_assigned" boolean DEFAULT false NOT NULL,
	"is_obsolete" boolean DEFAULT false NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"purchase_date" timestamp with time zone DEFAULT now(),
	"serial_number" text,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "equipment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "event_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_assignment_event_user" UNIQUE("event_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "event_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_date" timestamp with time zone DEFAULT now() NOT NULL,
	"event_type" text NOT NULL,
	"event_location" text NOT NULL,
	"event_name" text NOT NULL,
	"event_start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"event_end_time" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "training" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"training_date" timestamp with time zone DEFAULT now() NOT NULL,
	"training_location" text NOT NULL,
	"training_type" text NOT NULL,
	"training_instructor" integer NOT NULL,
	"training_start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"training_end_time" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "training" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "training_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "training_assignment_training_user" UNIQUE("training_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "training_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "uniform_sizes" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"notes" text,
	"pant_size" varchar(10) NOT NULL,
	"shirt_size" varchar(10) NOT NULL,
	"shoe_size" varchar(10) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "uniform_sizes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user" (
	"callsign" text,
	"city" text,
	"clerk_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"driver_license" text,
	"driver_license_state" text,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"position" "position" DEFAULT 'reserve' NOT NULL,
	"radio_number" text,
	"role" "role" DEFAULT 'guest' NOT NULL,
	"state" text,
	"street_address" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"zip_code" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ADD CONSTRAINT "assigned_equipment_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ADD CONSTRAINT "assigned_equipment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_contact" ADD CONSTRAINT "emergency_contact_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assignments" ADD CONSTRAINT "event_assignments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assignments" ADD CONSTRAINT "event_assignments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training" ADD CONSTRAINT "training_training_instructor_user_id_fk" FOREIGN KEY ("training_instructor") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_assignments" ADD CONSTRAINT "training_assignments_training_id_training_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_assignments" ADD CONSTRAINT "training_assignments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uniform_sizes" ADD CONSTRAINT "uniform_sizes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;