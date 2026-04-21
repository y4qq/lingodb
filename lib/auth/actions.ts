"use server";

// Server actions for auth flows that currently run client-side via
// @supabase/supabase-js in `components/auth/*-form.tsx`. When those move to
// the server-action style (progressive enhancement, one consistent
// controller layer), their bodies land here — e.g. signUpAction,
// signInAction, signOutAction, resetPasswordAction, updatePasswordAction.
//
// No exports yet — the client forms in components/auth/ still call
// supabase-js directly.
