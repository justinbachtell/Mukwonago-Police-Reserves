-- Add notification type column to notifications table
ALTER TABLE "notifications" ADD COLUMN "type" notification_type NOT NULL; 