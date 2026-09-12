// OAuth callbacks run on the API domain, so a missing or scheme-less
// FRONTEND_URL would make the browser resolve the redirect against the API
// host (e.g. "pongmasters.obeaj.me" -> https://api-host/.../pongmasters.obeaj.me).
export function getFrontendUrl(): string {
  const raw = (process.env.FRONTEND_URL ?? '').trim();
  if (!raw) {
    console.warn('FRONTEND_URL is not set; OAuth redirects will stay on the API host.');
    return '/';
  }
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return url.replace(/\/+$/, '');
}

export function withQuery(base: string, params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();
  const separator = base.includes('?') ? '&' : base.endsWith('/') ? '?' : '/?';
  return `${base}${separator}${query}`;
}
