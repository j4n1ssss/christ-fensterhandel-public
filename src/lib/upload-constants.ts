/**
 * Shared file upload constants for Rueckfrage-Antwort and Reklamation.
 * Used by both client-side validation (components) and server-side validation (API routes).
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
] as const;

export const MAX_RUECKFRAGE_FILES = 3;
export const MAX_REKLAMATION_FILES = 5;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
