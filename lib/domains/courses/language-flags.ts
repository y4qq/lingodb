import type { Flags } from "flagpack-core";

// Presentation-only mapping: ISO 639-1 language code (stored on
// `languages.code`) → ISO 3166-1 alpha-2 country code used by flagpack.
// Lives in code rather than the DB because it's static UI metadata that
// never varies per tenant and doesn't belong in the domain model.
// Add a new row here whenever a language is added to the seed.
const LANGUAGE_FLAGS: Record<string, Flags> = {
  en: "GB-UKM", // flagpack uses the UK-wide Union Flag code, not a plain "GB".
  th: "TH",
  es: "ES",
  fr: "FR",
  ja: "JP",
  de: "DE",
  it: "IT",
  pt: "BR",
};

export function flagForLanguageCode(code: string): Flags | null {
  return LANGUAGE_FLAGS[code] ?? null;
}
