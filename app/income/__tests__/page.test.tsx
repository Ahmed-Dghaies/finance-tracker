import { render, screen, waitFor } from "@testing-library/react";

import * as incomeDb from "@/lib/db/income";
import * as settingsDb from "@/lib/db/settings";

import IncomePage from "../page";

jest.mock("@/lib/db/income");
jest.mock("@/lib/db/settings");
jest.mock("@/components/navigation", () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));
jest.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: unknown }) => <>{children}</>,
}));

describe("IncomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(settingsDb.getSetting).mockResolvedValue("EUR");
    jest.mocked(incomeDb.getIncomeByMonth).mockResolvedValue([
      {
        id: "1",
        amount: 3000,
        currency: "EUR",
        category: "fixed",
        date: "01/01/2024",
        recurring: true,
      },
      {
        id: "2",
        amount: 500,
        currency: "EUR",
        category: "variable",
        date: "15/01/2024",
        recurring: false,
      },
    ]);
  });

  it("displays income summary cards", async () => {
    render(<IncomePage />);

    await waitFor(() => {
      expect(screen.getByText("Total Income")).toBeInTheDocument();
      expect(screen.getByText("Fixed")).toBeInTheDocument();
      expect(screen.getByText("Variable")).toBeInTheDocument();
      expect(screen.getByText("Other")).toBeInTheDocument();
    });
  });

  it("displays income list", async () => {
    render(<IncomePage />);

    await waitFor(() => {
      expect(screen.getByText("fixed")).toBeInTheDocument();
      expect(screen.getByText("variable")).toBeInTheDocument();
    });
  });

  it("calculates totals correctly", async () => {
    render(<IncomePage />);

    await waitFor(() => {
      expect(screen.getByText("€3500.00")).toBeInTheDocument(); // Total
      expect(screen.getByText("€3000.00")).toBeInTheDocument(); // Fixed
      expect(screen.getByText("€500.00")).toBeInTheDocument(); // Variable
    });
  });

  it("shows recurring badge for recurring income", async () => {
    render(<IncomePage />);

    await waitFor(() => {
      const recurringBadges = screen.getAllByText("Recurring");
      expect(recurringBadges).toHaveLength(1);
    });
  });

  it("shows add income button", async () => {
    render(<IncomePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /add income/i })).toBeInTheDocument();
    });
  });
});
