-- Hand-written companion to 20260421072804_clever_molly_hayes.sql.
-- Adds the deferrable position uniques that Drizzle has no declarative API for.

-- Deferrable position uniques: lets admins reorder rows within a transaction
-- where uniqueness is transiently violated between two swaps.
ALTER TABLE public.units
  ADD CONSTRAINT units_course_position_key UNIQUE (course_id, position)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_unit_position_key UNIQUE (unit_id, position)
  DEFERRABLE INITIALLY DEFERRED;
