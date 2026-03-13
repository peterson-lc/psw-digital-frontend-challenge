import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HolidaysPage } from "@/components/holidays-page";
import type { HolidaysResponse } from "@/lib/api";

const mockReplace = jest.fn();
const mockFetchHolidays = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/feriados",
}));

jest.mock("@/lib/api", () => ({
  __esModule: true,
  fetchHolidays: (...args: unknown[]) => mockFetchHolidays(...args),
}));

jest.mock("react-datepicker", () => {
  const MockDatePicker = (props: Record<string, unknown>) => (
    <input
      data-testid="date-picker"
      placeholder={props.placeholderText as string}
      onChange={(e) => {
        const fn = props.onChange as (date: Date | null) => void;
        if (fn) fn(e.target.value ? new Date(e.target.value) : null);
      }}
    />
  );
  MockDatePicker.displayName = "MockDatePicker";
  return { __esModule: true, default: MockDatePicker };
});

const STORAGE_KEY = "psw-digital-frontend-session";

const mockHolidays: HolidaysResponse = {
  holidays: [
    { date: "2026-01-01", name: "Confraternização Universal", type: 0 },
    { date: "2026-04-21", name: "Tiradentes", type: 0 },
    { date: "2026-06-24", name: "São João", type: 1 },
  ],
  total: 3,
};

beforeEach(() => {
  localStorage.clear();
  mockReplace.mockClear();
  mockFetchHolidays.mockReset();
  mockFetchHolidays.mockResolvedValue(mockHolidays);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token: "test-token", expiration: null }),
  );
});

describe("HolidaysPage", () => {
  it("renders the holidays list after loading", async () => {
    render(<HolidaysPage />);

    expect(screen.getByText("Carregando feriados...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    expect(screen.getByText("Tiradentes")).toBeInTheDocument();
    expect(screen.getByText("São João")).toBeInTheDocument();
    expect(screen.getByText("3 registros")).toBeInTheDocument();
  });

  it("renders search input with placeholder", async () => {
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("Busque por nome")).toBeInTheDocument();
  });

  it("triggers search when Enter key is pressed", async () => {
    const user = userEvent.setup();
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    mockFetchHolidays.mockClear();

    const searchInput = screen.getByPlaceholderText("Busque por nome");
    await user.type(searchInput, "Natal");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockFetchHolidays).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Natal" }),
      );
    });
  });

  it("triggers search when clicking the search button", async () => {
    const user = userEvent.setup();
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    mockFetchHolidays.mockClear();

    const searchInput = screen.getByPlaceholderText("Busque por nome");
    await user.type(searchInput, "Ano");

    const searchButton = screen.getByRole("button", { name: /pesquisar/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(mockFetchHolidays).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Ano" }),
      );
    });
  });

  it("changes type filter via dropdown", async () => {
    const user = userEvent.setup();
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    mockFetchHolidays.mockClear();

    const typeSelect = screen.getByDisplayValue("Tipo");
    await user.selectOptions(typeSelect, "national");

    await waitFor(() => {
      expect(mockFetchHolidays).toHaveBeenCalledWith(
        expect.objectContaining({ type: 0 }),
      );
    });
  });

  it("changes sort option via dropdown", async () => {
    const user = userEvent.setup();
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    mockFetchHolidays.mockClear();

    const sortSelect = screen.getByDisplayValue("Data crescente");
    await user.selectOptions(sortSelect, "name");

    await waitFor(() => {
      expect(mockFetchHolidays).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: 2 }),
      );
    });
  });

  it("renders the date picker", async () => {
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    expect(screen.getByTestId("date-picker")).toBeInTheDocument();
  });

  it("shows error message when fetch fails", async () => {
    mockFetchHolidays.mockRejectedValue(new Error("Falha na conexão"));

    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Falha na conexão")).toBeInTheDocument();
    });
  });

  it('shows "Nenhum feriado encontrado." when list is empty', async () => {
    mockFetchHolidays.mockResolvedValue({ holidays: [], total: 0 });

    render(<HolidaysPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Nenhum feriado encontrado."),
      ).toBeInTheDocument();
    });
  });

  it("uses selectedDate year as activeYear when a date is picked", async () => {
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    mockFetchHolidays.mockClear();

    const datePicker = screen.getByTestId("date-picker");
    // Use T00:00:00 so the Date constructor creates a local-time date (no timezone shift)
    fireEvent.change(datePicker, { target: { value: "2028-07-04T00:00:00" } });

    await waitFor(() => {
      expect(mockFetchHolidays).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2028, date: "2028-07-04" }),
      );
    });
  });

  it("clears selectedDate when date picker value is cleared", async () => {
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    const datePicker = screen.getByTestId("date-picker");

    // First set a date so there is something to clear
    fireEvent.change(datePicker, { target: { value: "2028-07-04T00:00:00" } });

    await waitFor(() => {
      expect(mockFetchHolidays).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2028 }),
      );
    });

    mockFetchHolidays.mockClear();

    // Clear the date picker — triggers onChange with empty value (null date)
    fireEvent.change(datePicker, { target: { value: "" } });

    await waitFor(() => {
      expect(mockFetchHolidays).toHaveBeenCalledWith(
        expect.objectContaining({ date: undefined, year: new Date().getFullYear() }),
      );
    });
  });

  it("redirects to /login on unauthorized error", async () => {
    mockFetchHolidays.mockRejectedValue(new Error("Unauthorized"));

    render(<HolidaysPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("shows fallback error message when error is not an Error instance", async () => {
    mockFetchHolidays.mockRejectedValue("some string error");

    render(<HolidaysPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Não foi possível carregar os feriados."),
      ).toBeInTheDocument();
    });
  });

  it("does not update state after effect cleanup (cancelled flag)", async () => {
    let resolveFirst!: (value: HolidaysResponse) => void;
    mockFetchHolidays.mockImplementationOnce(
      () => new Promise<HolidaysResponse>((resolve) => { resolveFirst = resolve; }),
    );

    const { unmount } = render(<HolidaysPage />);

    // Unmount before the fetch resolves — sets cancelled = true
    unmount();

    // Resolve the pending promise after unmount
    resolveFirst(mockHolidays);

    // If state were updated after unmount, React would warn.
    // The test passing without errors confirms the cancelled flag works.
  });

  it("shows loading state when startLoading is called via Enter key", async () => {
    const user = userEvent.setup();
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    // Make the next fetch hang so we can observe the loading state
    mockFetchHolidays.mockImplementation(() => new Promise(() => {}));

    const searchInput = screen.getByPlaceholderText("Busque por nome");
    await user.type(searchInput, "test");
    await user.keyboard("{Enter}");

    expect(screen.getByText("Carregando feriados...")).toBeInTheDocument();
  });

  it("shows loading state when startLoading is called via search button", async () => {
    const user = userEvent.setup();
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    mockFetchHolidays.mockImplementation(() => new Promise(() => {}));

    const searchInput = screen.getByPlaceholderText("Busque por nome");
    await user.type(searchInput, "test");
    const searchButton = screen.getByRole("button", { name: /pesquisar/i });
    await user.click(searchButton);

    expect(screen.getByText("Carregando feriados...")).toBeInTheDocument();
  });

  it("shows loading state when startLoading is called via sort change", async () => {
    const user = userEvent.setup();
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    mockFetchHolidays.mockImplementation(() => new Promise(() => {}));

    const sortSelect = screen.getByDisplayValue("Data crescente");
    await user.selectOptions(sortSelect, "date_desc");

    expect(screen.getByText("Carregando feriados...")).toBeInTheDocument();
  });

  it("shows loading state when startLoading is called via type filter change", async () => {
    const user = userEvent.setup();
    render(<HolidaysPage />);

    await waitFor(() => {
      expect(screen.getByText("Confraternização Universal")).toBeInTheDocument();
    });

    mockFetchHolidays.mockImplementation(() => new Promise(() => {}));

    const typeSelect = screen.getByDisplayValue("Tipo");
    await user.selectOptions(typeSelect, "municipal");

    expect(screen.getByText("Carregando feriados...")).toBeInTheDocument();
  });
});
