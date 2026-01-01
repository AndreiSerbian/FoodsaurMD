-- Add column to control status change notifications per pickup point
ALTER TABLE public.point_telegram_settings 
ADD COLUMN IF NOT EXISTS notify_status_changes boolean NOT NULL DEFAULT true;