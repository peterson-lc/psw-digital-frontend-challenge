import { fetchHolidays, HolidayFilters, HolidaysResponse } from "@/lib/api";

const mockHolidaysResponse: HolidaysResponse = {
  holidays: [
    { date: "2026-01-01", name: "Confraternização Universal", type: 0 },
  ],
  total: 1,
};

function mockFetchSuccess() {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({ succeeded: true, data: mockHolidaysResponse }),
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = mockFetchSuccess();
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("fetchHolidays", () => {
  const baseFilters: HolidayFilters = {
    token: "test-token",
    year: 2026,
  };

  it("makes a GET request with Authorization header", async () => {
    const promise = fetchHolidays(baseFilters);
    jest.runAllTimers();
    await promise;

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/holidays/2026");
    expect(options.headers.Authorization).toBe("Bearer test-token");
  });

  it("forwards name query parameter", async () => {
    const promise = fetchHolidays({ ...baseFilters, name: "Natal" });
    jest.runAllTimers();
    await promise;

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("name=Natal");
  });

  it("forwards type query parameter", async () => {
    const promise = fetchHolidays({ ...baseFilters, type: 0 });
    jest.runAllTimers();
    await promise;

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("type=0");
  });

  it("forwards date query parameter", async () => {
    const promise = fetchHolidays({ ...baseFilters, date: "2026-12-25" });
    jest.runAllTimers();
    await promise;

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("date=2026-12-25");
  });

  it("forwards orderBy query parameter", async () => {
    const promise = fetchHolidays({ ...baseFilters, orderBy: 1 });
    jest.runAllTimers();
    await promise;

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("orderBy=1");
  });

  it("forwards multiple query parameters together", async () => {
    const promise = fetchHolidays({
      ...baseFilters,
      name: "Ano",
      type: 0,
      orderBy: 2,
    });
    jest.runAllTimers();
    await promise;

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("name=Ano");
    expect(url).toContain("type=0");
    expect(url).toContain("orderBy=2");
  });

  it("deduplicates concurrent requests with the same filters", async () => {
    const p1 = fetchHolidays(baseFilters);
    const p2 = fetchHolidays(baseFilters);

    expect(p1).toBe(p2);

    jest.runAllTimers();
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(r1).toEqual(mockHolidaysResponse);
    expect(r2).toEqual(mockHolidaysResponse);
  });

  it("makes separate requests for different filters", async () => {
    const p1 = fetchHolidays(baseFilters);
    const p2 = fetchHolidays({ ...baseFilters, name: "Natal" });

    expect(p1).not.toBe(p2);

    jest.runAllTimers();
    await Promise.all([p1, p2]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("returns holidays data from a successful response", async () => {
    const promise = fetchHolidays(baseFilters);
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual(mockHolidaysResponse);
  });

  it("throws on non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: "Unauthorized",
      json: () =>
        Promise.resolve({ succeeded: false, messages: ["Unauthorized"] }),
    });

    const promise = fetchHolidays({ ...baseFilters, token: "bad" });
    jest.runAllTimers();

    await expect(promise).rejects.toThrow("Unauthorized");
  });
});

