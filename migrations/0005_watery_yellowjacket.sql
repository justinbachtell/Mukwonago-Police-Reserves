ALTER TABLE "training" DROP CONSTRAINT "training_training_instructor_user_id_fk";
--> statement-breakpoint
ALTER TABLE "training" ALTER COLUMN "training_instructor" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "training" DROP COLUMN "custom_instructor";