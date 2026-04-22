ALTER TABLE "users" ADD COLUMN "onboarded_at" timestamp with time zone;

-- Existing users have already figured things out; don't re-onboard them.
UPDATE "users" SET "onboarded_at" = now() WHERE "onboarded_at" IS NULL;
