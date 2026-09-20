import { fetchWithTimeout } from "./retry";

const RECHTSPRAAK_HOSTS = ["data.rechtspraak.nl", "uitspraken.rechtspraak.nl"];

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function isStaticHost(): boolean {
  if (!isBrowser()) return false;
  const host = window.location.hostname;
  return host.endsWith("github.io");
}

export function needsServerProxy(url: string): boolean {
  if (!isBrowser()) return false;
  try {
    const host = new URL(url).hostname;
    return RECHTSPRAAK_HOSTS.includes(host);
  } catch {
    return false;
  }
}

export function apiBaseUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  }
  if (isBrowser()) {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    return `${window.location.origin}${basePath}`;
  }
  return "";
}

export async function fetchLegal(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  if (needsServerProxy(url) && (isStaticHost() || isBrowser())) {
    const proxyUrl = `${apiBaseUrl()}/api/juridisch/proxy?url=${encodeURIComponent(url)}`;
    try {
      const proxied = await fetch(proxyUrl, {
        method: "GET",
        headers: { Accept: "application/xml, application/json, */*" },
        signal: options.signal,
      });
      if (proxied.ok || proxied.status !== 404) {
        return proxied;
      }
    } catch {
      // val terug op directe fetch (bijv. lokaal met API-route)
    }
  }

  const headers = { ...options.headers } as Record<string, string>;
  if (isBrowser()) {
    delete headers["User-Agent"];
  }

  return fetchWithTimeout(url, {
    ...options,
    headers,
  });
}
