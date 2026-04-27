CREATE TABLE "user_lesson_feedback" (
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_lesson_feedback_pkey" PRIMARY KEY("user_id","lesson_id"),
	CONSTRAINT "user_lesson_feedback_rating_range_check" CHECK ("rating" BETWEEN 1 AND 5),
	CONSTRAINT "user_lesson_feedback_comment_length_check" CHECK ("comment" IS NULL OR char_length("comment") BETWEEN 1 AND 4000)
);
--> statement-breakpoint
ALTER TABLE "user_lesson_feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_lesson_feedback" ADD CONSTRAINT "user_lesson_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_feedback" ADD CONSTRAINT "user_lesson_feedback_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_lesson_feedback_lesson_id_created_at_idx" ON "user_lesson_feedback" USING btree ("lesson_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "user_lesson_feedback_rating_created_at_idx" ON "user_lesson_feedback" USING btree ("rating","created_at" DESC);
