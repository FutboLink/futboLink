export const TRANSFERMARKT_BASE_URL = "https://www.transfermarkt.com/";

export function resolveTransfermarktUrl(
  value: string | undefined | null,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${TRANSFERMARKT_BASE_URL}${trimmed.replace(/^\/+/, "")}`;
}
