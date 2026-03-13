"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DashboardShell } from "@/components/dashboard-shell";
import { ProtectedView } from "@/components/protected-view";
import { clearStoredSession, StoredSession } from "@/lib/auth";
import { HolidayDto, fetchHolidays } from "@/lib/api";
import {
  HolidayTypeFilter,
  formatHolidayDate,
  getHolidayTypeBadgeClassName,
  getHolidayTypeLabel,
} from "@/lib/holidays";

type SortOption = "date_asc" | "date_desc" | "name" | "type";

const SORT_ORDER_BY: Record<SortOption, number> = {
  date_asc: 0,
  date_desc: 1,
  name: 2,
  type: 3,
};

const TYPE_FILTER_VALUE: Record<string, number | undefined> = {
  all: undefined,
  national: 0,
  municipal: 1,
};

function HolidaysContent({ session }: { session: StoredSession }) {
  const router = useRouter();
  const [holidays, setHolidays] = useState<HolidayDto[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [typeFilter, setTypeFilter] = useState<HolidayTypeFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date_asc");

  const activeYear = selectedDate
    ? Number(selectedDate.slice(0, 4))
    : new Date().getFullYear();

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    fetchHolidays({
      token: session.token,
      year: activeYear,
      name: searchQuery || undefined,
      type: TYPE_FILTER_VALUE[typeFilter],
      date: selectedDate || undefined,
      orderBy: SORT_ORDER_BY[sortOption],
    })
      .then((response) => {
        if (!cancelled) {
          setHolidays(response.holidays ?? []);
          setTotal(response.total ?? 0);
        }
      })
      .catch((requestError) => {
        if (cancelled) return;

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar os feriados.";

        if (message.toLowerCase().includes("unauthorized")) {
          clearStoredSession();
          router.replace("/login");
          return;
        }

        setError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeYear, session.token, router, searchQuery, typeFilter, selectedDate, sortOption]);

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="block border-b border-[#ddd8d0] pb-3">
          <span className="sr-only">Buscar por nome</span>
          <input
            type="text"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setSearchQuery(searchDraft);
              }
            }}
            placeholder="Busque por nome"
            className="w-full bg-transparent text-sm text-[#7c7c85] outline-none placeholder:text-[#bbb3aa]"
          />
        </label>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
          <button
            type="button"
            onClick={() => setSearchQuery(searchDraft)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1017a8] text-white transition hover:bg-[#0a1085]"
            aria-label="Pesquisar por nome"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
              <circle cx="11" cy="11" r="6" />
              <path d="M20 20l-4.2-4.2" />
            </svg>
          </button>

          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#7c7c85]">
            {total} registros
          </span>

          <label className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-[#5f5b56]">
            Ordenar por
            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as SortOption)
              }
              className="rounded-full border border-transparent bg-transparent px-2 py-1 text-xs text-[#111827] outline-none"
            >
              <option value="date_asc">Data crescente</option>
              <option value="date_desc">Data decrescente</option>
              <option value="name">Nome</option>
              <option value="type">Tipo</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="relative inline-flex items-center">
          <span className="sr-only">Filtrar por tipo</span>
          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as HolidayTypeFilter)
            }
            className="h-11 min-w-28 appearance-none rounded-full border border-[#1f2937] bg-white px-5 pr-10 text-sm text-[#111827] outline-none"
          >
            <option value="all">Tipo</option>
            <option value="national">Nacional</option>
            <option value="municipal">Municipal</option>
          </select>
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-4 h-4 w-4 text-[#111827]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 10l5 5 5-5" />
          </svg>
        </label>

        <div className="relative inline-flex items-center">
          <DatePicker
            selected={selectedDate ? new Date(selectedDate + "T00:00:00") : null}
            onChange={(date: Date | null) => {
              if (date) {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                const dd = String(date.getDate()).padStart(2, "0");
                setSelectedDate(`${yyyy}-${mm}-${dd}`);
              } else {
                setSelectedDate("");
              }
            }}
            dateFormat="dd/MM/yyyy"
            placeholderText="Data do feriado"
            isClearable
            className="h-11 rounded-full border border-transparent bg-[#e8e8e6] px-5 pr-8 text-sm text-[#111827] outline-none placeholder:text-[#111827]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-[#e6e3dd] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
        <div className="grid grid-cols-[minmax(0,1.2fr)_140px_140px_32px] gap-4 border-b border-[#ece8e1] px-6 py-5 text-xs font-semibold text-[#6b7280]">
          <span>Nome</span>
          <span>Data</span>
          <span>Tipo</span>
          <span />
        </div>

        {isLoading ? (
          <p className="px-6 py-10 text-sm text-[#7c7c85]">Carregando feriados...</p>
        ) : error ? (
          <p className="px-6 py-10 text-sm text-[#b42318]">{error}</p>
        ) : holidays.length === 0 ? (
          <p className="px-6 py-10 text-sm text-[#7c7c85]">Nenhum feriado encontrado.</p>
        ) : (
          holidays.map((holiday, index) => (
            <div
              key={`${holiday.date}-${holiday.name}-${index}`}
              className="grid grid-cols-[minmax(0,1.2fr)_140px_140px_32px] gap-4 border-b border-[#f1eeea] px-6 py-7 text-sm text-[#3f3f46] last:border-b-0"
            >
              <span className="font-medium text-[#374151]">{holiday.name ?? "—"}</span>
              <span>{formatHolidayDate(holiday.date)}</span>
              <span>
                <span
                  className={`inline-flex min-w-24 items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${getHolidayTypeBadgeClassName(holiday.type)}`}
                >
                  {getHolidayTypeLabel(holiday.type)}
                </span>
              </span>
              <span className="flex items-center justify-end text-[#8b8b94]">›</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function HolidaysPage() {
  return (
    <DashboardShell>
      <ProtectedView>{(session) => <HolidaysContent session={session} />}</ProtectedView>
    </DashboardShell>
  );
}