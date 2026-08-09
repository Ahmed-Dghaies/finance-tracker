import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as exchangesDb from "@/lib/db/exchanges";
import * as possessionsDb from "@/lib/db/possessions";
import * as settingsDb from "@/lib/db/settings";

import PossessionsPage from "../page";

jest.mock("@/lib/db/possessions");
jest.mock("@/lib/db/exchanges");
jest.mock("@/lib/db/settings");
jest.mock("@/components/navigation", () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));
jest.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: unknown }) => <>{children}</>,
}));
jest.mock("@/components/forms", () => ({
  PossessionForm: () => <div>Possession Form</div>,
  ExchangeForm: () => <div>Exchange Form</div>,
}));

describe("PossessionsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(settingsDb.getSetting).mockResolvedValue("EUR");
    jest.mocked(possessionsDb.getAllPossessions).mockResolvedValue([]);
    jest.mocked(exchangesDb.getAllExchanges).mockResolvedValue([]);
    jest.mocked(exchangesDb.getCurrencyBalances).mockResolvedValue([]);
  });

  it("displays possession tabs", async () => {
    await act(async () => {
      render(<PossessionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /foreign money/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /possessions/i })).toBeInTheDocument();
    });
  });

  it("renders loading state initially", () => {
    render(<PossessionsPage />);
    // Component returns null during loading, so we just check it renders without crashing
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });

  it("displays possession summary cards", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<PossessionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /possessions/i })).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole("tab", { name: /possessions/i }));
    });

    await waitFor(
      () => {
        expect(screen.getByText("Total Items")).toBeInTheDocument();
        expect(screen.getByText("Purchase Cost")).toBeInTheDocument();
        expect(screen.getByText("Current Value")).toBeInTheDocument();
        expect(screen.getByText("Value Change")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("shows add possession button", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<PossessionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /possessions/i })).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole("tab", { name: /possessions/i }));
    });

    await waitFor(
      () => {
        expect(screen.getByRole("button", { name: /add possession/i })).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("calculates totals correctly", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<PossessionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /possessions/i })).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole("tab", { name: /possessions/i }));
    });

    await waitFor(
      () => {
        // Check for "0" which is the number of items
        expect(screen.getByText("0")).toBeInTheDocument();
        // Check for €0.00 values
        const euroValues = screen.getAllByText("€0.00");
        expect(euroValues.length).toBeGreaterThanOrEqual(2); // Purchase Cost and Current Value
        // Check for percentage
        expect(screen.getByText("+0.0%")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("shows empty state when no possessions", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<PossessionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /possessions/i })).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole("tab", { name: /possessions/i }));
    });

    await waitFor(
      () => {
        expect(screen.getByText("No possessions tracked yet.")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
