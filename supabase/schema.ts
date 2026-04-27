import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const userRole = pgEnum('user_role', ['user', 'admin']);
export const moderationStatus = pgEnum('moderation_status', ['pending', 'approved', 'rejected']);
export const reactionType = pgEnum('reaction_type', ['like', 'dislike']);

const authSchema = pgSchema('auth');
const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  role: userRole('role').notNull().default('user'),
  activeCourseId: uuid('active_course_id').references((): AnyPgColumn => courses.id, { onDelete: 'set null' }),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
  ...timestamps,
}).enableRLS();

export const languages = pgTable('languages', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  ...timestamps,
}).enableRLS();

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  label: text('label').notNull(),
  ...timestamps,
}).enableRLS();

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  baseLanguageId: uuid('base_language_id').notNull().references(() => languages.id),
  targetLanguageId: uuid('target_language_id').notNull().references(() => languages.id),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  isPublished: boolean('is_published').notNull().default(false),
  isFree: boolean('is_free').notNull().default(true),
  ...timestamps,
}, (t) => [
  unique('courses_base_target_key').on(t.baseLanguageId, t.targetLanguageId),
  check('courses_base_not_target_check', sql`${t.baseLanguageId} <> ${t.targetLanguageId}`),
]).enableRLS();

// Deferrable unique `(course_id, position)` is added in the companion migration
// to support transactional reordering.
export const units = pgTable('units', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  position: integer('position').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  isFree: boolean('is_free').notNull().default(true),
  ...timestamps,
}, (t) => [
  unique('units_course_slug_key').on(t.courseId, t.slug),
  index('units_course_position_idx').on(t.courseId, t.position),
]).enableRLS();

// Deferrable unique `(unit_id, position)` is added in the companion migration.
export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  unitId: uuid('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'),
  position: integer('position').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  ...timestamps,
}, (t) => [
  unique('lessons_unit_slug_key').on(t.unitId, t.slug),
  index('lessons_unit_position_idx').on(t.unitId, t.position),
]).enableRLS();

export const lessonAudioVersions = pgTable('lesson_audio_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  audioPath: text('audio_path').notNull(),
  audioDurationSeconds: integer('audio_duration_seconds'),
  isCurrent: boolean('is_current').notNull().default(false),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  ...timestamps,
}, (t) => [
  unique('lesson_audio_versions_lesson_label_key').on(t.lessonId, t.label),
  // Partial unique: at most one active-and-current version per lesson.
  // Disabled rows never occupy this slot.
  uniqueIndex('lesson_audio_versions_one_current_per_lesson_idx')
    .on(t.lessonId)
    .where(sql`${t.isCurrent} AND ${t.disabledAt} IS NULL`),
  check(
    'lesson_audio_versions_disabled_not_current_check',
    sql`NOT (${t.isCurrent} AND ${t.disabledAt} IS NOT NULL)`,
  ),
]).enableRLS();

export const userCourses = pgTable('user_courses', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.courseId], name: 'user_courses_pkey' }),
  index('user_courses_course_id_idx').on(t.courseId),
]).enableRLS();

export const userLessonProgress = pgTable('user_lesson_progress', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  lastPositionSeconds: integer('last_position_seconds').notNull().default(0),
  lastAudioVersionId: uuid('last_audio_version_id').references(() => lessonAudioVersions.id, { onDelete: 'set null' }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  lastPlayedAt: timestamp('last_played_at', { withTimezone: true }).notNull().defaultNow(),
  ...timestamps,
}, (t) => [
  primaryKey({ columns: [t.userId, t.lessonId], name: 'user_lesson_progress_pkey' }),
  index('user_lesson_progress_user_id_idx').on(t.userId),
  check(
    'user_lesson_progress_position_nonnegative_check',
    sql`${t.lastPositionSeconds} >= 0`,
  ),
]).enableRLS();

export const lessonTags = pgTable('lesson_tags', {
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  ...timestamps,
}, (t) => [
  primaryKey({ columns: [t.lessonId, t.tagId], name: 'lesson_tags_pkey' }),
  index('lesson_tags_tag_id_idx').on(t.tagId),
]).enableRLS();

export const lessonDependencies = pgTable('lesson_dependencies', {
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  requiredUnitId: uuid('required_unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  ...timestamps,
}, (t) => [
  primaryKey({ columns: [t.lessonId, t.requiredUnitId], name: 'lesson_dependencies_pkey' }),
  index('lesson_dependencies_required_unit_id_idx').on(t.requiredUnitId),
]).enableRLS();

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  parentCommentId: uuid('parent_comment_id').references((): AnyPgColumn => comments.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id),
  unitId: uuid('unit_id').references(() => units.id),
  lessonId: uuid('lesson_id').references(() => lessons.id),
  audioVersionId: uuid('audio_version_id').references(() => lessonAudioVersions.id, { onDelete: 'cascade' }),
  timepointSeconds: integer('timepoint_seconds'),
  body: text('body').notNull(),
  moderationStatus: moderationStatus('moderation_status').notNull().default('pending'),
  moderatedAt: timestamp('moderated_at', { withTimezone: true }),
  moderatedBy: uuid('moderated_by').references(() => users.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  ...timestamps,
}, (t) => [
  check('comments_body_length_check', sql`char_length(${t.body}) between 1 and 4000`),
  check(
    'comments_target_integrity_check',
    sql`
      (${t.parentCommentId} IS NULL
        AND num_nonnulls(${t.courseId}, ${t.unitId}, ${t.lessonId}) = 1
        AND (${t.audioVersionId} IS NOT NULL) = (${t.lessonId} IS NOT NULL)
        AND (${t.timepointSeconds} IS NULL OR ${t.lessonId} IS NOT NULL))
      OR
      (${t.parentCommentId} IS NOT NULL
        AND ${t.courseId} IS NULL AND ${t.unitId} IS NULL AND ${t.lessonId} IS NULL
        AND ${t.audioVersionId} IS NULL AND ${t.timepointSeconds} IS NULL)
    `,
  ),
  index('comments_moderation_queue_idx')
    .on(t.moderationStatus, t.createdAt.desc())
    .where(sql`${t.parentCommentId} IS NULL`),
  index('comments_lesson_thread_idx')
    .on(t.lessonId, t.audioVersionId, t.moderationStatus)
    .where(sql`${t.parentCommentId} IS NULL`),
  index('comments_parent_comment_id_idx').on(t.parentCommentId),
  index('comments_course_id_idx').on(t.courseId),
  index('comments_unit_id_idx').on(t.unitId),
]).enableRLS();

export const commentReactions = pgTable('comment_reactions', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  commentId: uuid('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  reaction: reactionType('reaction').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.commentId], name: 'comment_reactions_pkey' }),
  index('comment_reactions_comment_id_idx').on(t.commentId),
]).enableRLS();
