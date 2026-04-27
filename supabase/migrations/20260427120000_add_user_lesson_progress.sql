CREATE TABLE "user_lesson_progress" (
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"last_position_seconds" integer DEFAULT 0 NOT NULL,
	"last_audio_version_id" uuid,
	"completed_at" timestamp with time zone,
	"last_played_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY("user_id","lesson_id"),
	CONSTRAINT "user_lesson_progress_position_nonnegative_check" CHECK ("last_position_seconds" >= 0)
);
--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_last_audio_version_id_lesson_audio_versions_id_fk" FOREIGN KEY ("last_audio_version_id") REFERENCES "public"."lesson_audio_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_lesson_progress_user_id_idx" ON "user_lesson_progress" USING btree ("user_id");
