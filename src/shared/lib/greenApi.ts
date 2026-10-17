export const GREEN_API_LEGACY_BASE_URL = 'https://api.green-api.com';

export function deriveGreenApiBaseUrl(idInstance: string): string {
  const prefix = idInstance.replace(/\D/g, '').slice(0, 4);

  if (prefix.length === 4) {
    return `https://${prefix}.api.greenapi.com`;
  }

  return GREEN_API_LEGACY_BASE_URL;
}

export function resolveGreenApiBaseUrl(options: {
  idInstance: string;
  apiUrl?: string | null;
  override?: string;
}): string {
  const explicit = options.apiUrl?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  if (options.override) return options.override.replace(/\/$/, '');

  return deriveGreenApiBaseUrl(options.idInstance);
}
