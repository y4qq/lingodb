import { relations } from "drizzle-orm";
import {
  commentReactions,
  comments,
  courses,
  languages,
  lessonAudioVersions,
  lessonDependencies,
  lessonTags,
  lessons,
  units,
  tags,
  userCourses,
  userLessonFeedback,
  userLessonProgress,
  users,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  authoredComments: many(comments, { relationName: "comments_author" }),
  moderatedComments: many(comments, { relationName: "comments_moderator" }),
  enrollments: many(userCourses),
  lessonProgress: many(userLessonProgress),
  lessonFeedback: many(userLessonFeedback),
  activeCourse: one(courses, {
    fields: [users.activeCourseId],
    references: [courses.id],
    relationName: "users_active_course",
  }),
}));

export const userCoursesRelations = relations(userCourses, ({ one }) => ({
  user: one(users, {
    fields: [userCourses.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [userCourses.courseId],
    references: [courses.id],
  }),
}));

export const languagesRelations = relations(languages, ({ many }) => ({
  coursesAsBase: many(courses, { relationName: "courses_base_language" }),
  coursesAsTarget: many(courses, { relationName: "courses_target_language" }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  baseLanguage: one(languages, {
    fields: [courses.baseLanguageId],
    references: [languages.id],
    relationName: "courses_base_language",
  }),
  targetLanguage: one(languages, {
    fields: [courses.targetLanguageId],
    references: [languages.id],
    relationName: "courses_target_language",
  }),
  units: many(units),
  comments: many(comments),
  enrollments: many(userCourses),
  activeForUsers: many(users, { relationName: "users_active_course" }),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
  dependents: many(lessonDependencies),
  comments: many(comments),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  audioVersions: many(lessonAudioVersions),
  tags: many(lessonTags),
  dependencies: many(lessonDependencies),
  comments: many(comments),
  progress: many(userLessonProgress),
  feedback: many(userLessonFeedback),
}));

export const userLessonFeedbackRelations = relations(userLessonFeedback, ({ one }) => ({
  user: one(users, {
    fields: [userLessonFeedback.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userLessonFeedback.lessonId],
    references: [lessons.id],
  }),
}));

export const userLessonProgressRelations = relations(userLessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userLessonProgress.lessonId],
    references: [lessons.id],
  }),
  lastAudioVersion: one(lessonAudioVersions, {
    fields: [userLessonProgress.lastAudioVersionId],
    references: [lessonAudioVersions.id],
  }),
}));

export const lessonAudioVersionsRelations = relations(lessonAudioVersions, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [lessonAudioVersions.lessonId],
    references: [lessons.id],
  }),
  comments: many(comments),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  lessons: many(lessonTags),
}));

export const lessonTagsRelations = relations(lessonTags, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonTags.lessonId],
    references: [lessons.id],
  }),
  tag: one(tags, {
    fields: [lessonTags.tagId],
    references: [tags.id],
  }),
}));

export const lessonDependenciesRelations = relations(lessonDependencies, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonDependencies.lessonId],
    references: [lessons.id],
  }),
  requiredUnit: one(units, {
    fields: [lessonDependencies.requiredUnitId],
    references: [units.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
    relationName: "comments_author",
  }),
  moderator: one(users, {
    fields: [comments.moderatedBy],
    references: [users.id],
    relationName: "comments_moderator",
  }),
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "comments_replies",
  }),
  replies: many(comments, { relationName: "comments_replies" }),
  course: one(courses, {
    fields: [comments.courseId],
    references: [courses.id],
  }),
  unit: one(units, {
    fields: [comments.unitId],
    references: [units.id],
  }),
  lesson: one(lessons, {
    fields: [comments.lessonId],
    references: [lessons.id],
  }),
  audioVersion: one(lessonAudioVersions, {
    fields: [comments.audioVersionId],
    references: [lessonAudioVersions.id],
  }),
  reactions: many(commentReactions),
}));

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  user: one(users, {
    fields: [commentReactions.userId],
    references: [users.id],
  }),
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
}));
