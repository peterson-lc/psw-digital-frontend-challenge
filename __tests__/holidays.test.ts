import {
  formatHolidayDate,
  getHolidayTypeLabel,
  getHolidayTypeBadgeClassName,
} from "@/lib/holidays";

describe("formatHolidayDate", () => {
  it("formats yyyy-MM-dd to dd/MM/yyyy", () => {
    expect(formatHolidayDate("2026-01-01")).toBe("01/01/2026");
  });

  it("formats another date correctly", () => {
    expect(formatHolidayDate("2025-12-25")).toBe("25/12/2025");
  });

  it("returns the original value when the format is invalid", () => {
    expect(formatHolidayDate("invalid")).toBe("invalid");
  });

  it("returns the original value for partial date", () => {
    expect(formatHolidayDate("2026-01")).toBe("2026-01");
  });

  it("returns the original value for empty string", () => {
    expect(formatHolidayDate("")).toBe("");
  });
});

describe("getHolidayTypeLabel", () => {
  it('returns "Municipal" for type 1', () => {
    expect(getHolidayTypeLabel(1)).toBe("Municipal");
  });

  it('returns "Nacional" for type 0', () => {
    expect(getHolidayTypeLabel(0)).toBe("Nacional");
  });

  it('returns "Nacional" for any other number', () => {
    expect(getHolidayTypeLabel(99)).toBe("Nacional");
  });
});

describe("getHolidayTypeBadgeClassName", () => {
  it("returns yellow classes for type 1 (Municipal)", () => {
    const result = getHolidayTypeBadgeClassName(1);
    expect(result).toContain("bg-[#f8e71c]");
    expect(result).toContain("text-[#3f3f14]");
  });

  it("returns green classes for type 0 (Nacional)", () => {
    const result = getHolidayTypeBadgeClassName(0);
    expect(result).toContain("bg-[#b9e61f]");
    expect(result).toContain("text-[#274000]");
  });
});

