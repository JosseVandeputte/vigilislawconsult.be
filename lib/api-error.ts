import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

const FIELD_LABELS: Record<string, string> = {
  name: 'Naam',
  email: 'E-mailadres',
  date: 'Datum',
  startTime: 'Startuur',
  endTime: 'Einduur',
  description: 'Beschrijving',
  status: 'Status',
  reason: 'Reden',
  expiresAt: 'Vervaldatum',
  token: 'Toegangscode',
};

/** Converts a ZodError into a readable Dutch string, e.g. "Naam: te kort; E-mailadres: ongeldig" */
export function formatZodError(err: ZodError): string {
  const messages = err.issues.map((issue) => {
    const field = issue.path.join('.') || 'invoer';
    const label = FIELD_LABELS[field] ?? field;
    // Map common Zod messages to Dutch
    let msg = issue.message;
    if (msg.toLowerCase().includes('invalid email')) msg = 'ongeldig e-mailadres';
    else if (msg.toLowerCase().includes('at least')) msg = `te kort (minimaal vereist)`;
    else if (msg.toLowerCase().includes('invalid')) msg = 'ongeldige waarde';
    else if (msg.toLowerCase().includes('required')) msg = 'verplicht veld';
    return `${label}: ${msg}`;
  });
  return messages.join('; ');
}

/** Returns a 500 response and logs the error server-side */
export function internalError(context: string, err: unknown): NextResponse {
  console.error(`[api:${context}]`, err);
  return NextResponse.json(
    { error: 'Er is een serverfout opgetreden. Probeer het later opnieuw.' },
    { status: 500 }
  );
}
