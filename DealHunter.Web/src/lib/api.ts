export class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
  pin?: string | null
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  
  if (pin) {
    headers.set('x-pin', pin);
  }

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new ApiError('INVALID_PIN_CREDENTIAL', 401);
  }

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;
    try {
      const data = await response.clone().json();
      if (data && typeof data.error === 'string') {
        message = data.error;
      }
    } catch {
      // ignore JSON parse failure
    }
    throw new ApiError(message, response.status);
  }

  return response;
}
