export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; label?: string } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, label = "operation" } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        console.warn(`[retry] ${label} attempt ${attempt + 1} failed, retrying in ${delay}ms`);
      }
    }
  }

  throw lastError ?? new Error(`${label} failed after ${maxRetries} retries`);
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 15000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "User-Agent": process.env.LEGAL_USER_AGENT ?? "JuridischOnderzoeksplatform/1.0",
        Accept: "application/json, application/xml, text/xml, */*",
        ...fetchOptions.headers,
      },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
