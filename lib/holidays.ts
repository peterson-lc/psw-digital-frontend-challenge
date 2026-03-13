export type HolidayTypeFilter = "all" | "national" | "municipal";

export function formatHolidayDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function getHolidayTypeLabel(type: number) {
  return type === 1 ? "Municipal" : "Nacional";
}

export function getHolidayTypeBadgeClassName(type: number) {
  return type === 1
    ? "bg-[#f8e71c] text-[#3f3f14]"
    : "bg-[#b9e61f] text-[#274000]";
}