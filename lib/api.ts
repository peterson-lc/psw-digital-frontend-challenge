type ApiEnvelope<T> = {
  succeeded: boolean;
  data?: T | null;
  messages?: string[] | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string | null;
  expiration?: string;
};

export type HolidayDto = {
  date: string;
  name: string | null;
  type: number;
};

export type HolidaysResponse = {
  holidays: HolidayDto[] | null;
  total: number;
};

function buildUrl(path: string) {
  return `/api${path}`;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.succeeded || !payload.data) {
    const message = payload?.messages?.[0] || response.statusText || "Request failed";
    throw new Error(message);
  }

  return payload.data;
}

export async function login(payload: LoginPayload) {
  const response = await fetch(buildUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<LoginResponse>(response);
}

export type HolidayFilters = {
  token: string;
  year: number;
  name?: string;
  type?: number;
  date?: string;
  orderBy?: number;
};

const inflightHolidays = new Map<string, Promise<HolidaysResponse>>();

export function fetchHolidays(filters: HolidayFilters): Promise<HolidaysResponse> {
  const { token, year, name, type, date, orderBy } = filters;

  const params = new URLSearchParams();
  if (name) params.set("name", name);
  if (type !== undefined) params.set("type", String(type));
  if (date) params.set("date", date);
  if (orderBy !== undefined) params.set("orderBy", String(orderBy));

  const query = params.toString();
  const url = buildUrl(`/holidays/${year}`) + (query ? `?${query}` : "");
  const cacheKey = `${url}:${token}`;

  const existing = inflightHolidays.get(cacheKey);
  if (existing) {
    return existing;
  }

  const request = fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })
    .then((response) => parseApiResponse<HolidaysResponse>(response))
    .finally(() => {
      setTimeout(() => {
        if (inflightHolidays.get(cacheKey) === request) {
          inflightHolidays.delete(cacheKey);
        }
      }, 500);
    });

  inflightHolidays.set(cacheKey, request);

  return request;
}