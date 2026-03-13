import { render, screen } from "@testing-library/react";
import { ProtectedView } from "@/components/protected-view";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const STORAGE_KEY = "psw-digital-frontend-session";

beforeEach(() => {
  localStorage.clear();
  mockReplace.mockClear();
});

describe("ProtectedView", () => {
  it('redirects to /login when no session exists', () => {
    render(
      <ProtectedView>
        {(session) => <div>Welcome {session.token}</div>}
      </ProtectedView>,
    );

    expect(mockReplace).toHaveBeenCalledWith("/login");
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("renders children when a valid session exists", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: "valid-token", expiration: null }),
    );

    render(
      <ProtectedView>
        {(session) => <div>Welcome {session.token}</div>}
      </ProtectedView>,
    );

    expect(screen.getByText("Welcome valid-token")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows loading and redirects when session has empty token', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: "", expiration: null }),
    );

    render(
      <ProtectedView>
        {(session) => <div>Welcome {session.token}</div>}
      </ProtectedView>,
    );

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });
});

