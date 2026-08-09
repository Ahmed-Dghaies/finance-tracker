import { render, screen, waitFor } from "@testing-library/react";

import * as investmentsDb from "@/lib/db/investments";
import * as settingsDb from "@/lib/db/settings";

import InvestmentsPage from "../page";

jest.mock("@/lib/db/investments");
jest.mock("@/lib/db/settings");
jest.mock("@/components/navigation", () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));
jest.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: unknown }) => <>{children}</>,
}));

describe("InvestmentsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(settingsDb.getSetting).mockResolvedValue("EUR");
    jest.mocked(investmentsDb.getAllInvestments).mockResolvedValue([
      {
        id: "1",
        name: "S&P 500",
        type: "stocks",
        initialAmount: 1000,
        currency: "EUR",
        currentValue: 1200,
        expectedYearlyPercentage: 8,
        startDate: "01/01/2024",
      },
      {
        id: "2",
        name: "Bitcoin",
        type: "crypto",
        initialAmount: 500,
        currency: "EUR",
        expectedYearlyPercentage: 15,
        startDate: "01/02/2024",
      },
    ]);
  });

  it("displays investment summary cards", async () => {
    render(<InvestmentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Total Invested")).toBeInTheDocument();
      expect(screen.getAllByText("Current Value").length).toBeGreaterThan(0);
      expect(screen.getByText("Total Return")).toBeInTheDocument();
      expect(screen.getAllByText("Return %").length).toBeGreaterThan(0);
    });
  });

  it("calculates investment returns correctly", async () => {
    render(<InvestmentsPage />);

    await waitFor(() => {
      expect(screen.getByText("€1500.00")).toBeInTheDocument(); // Total invested
      expect(screen.getByText("€1700.00")).toBeInTheDocument(); // Current value (1200 + 500)
      expect(screen.getByText("€200.00")).toBeInTheDocument(); // Return
    });
  });

  it("displays investment list", async () => {
    render(<InvestmentsPage />);

    await waitFor(() => {
      expect(screen.getByText("S&P 500")).toBeInTheDocument();
      expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    });
  });

  it("shows portfolio breakdown", async () => {
    render(<InvestmentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Portfolio Breakdown")).toBeInTheDocument();
      expect(screen.getAllByText("stocks").length).toBeGreaterThan(0);
      expect(screen.getAllByText("crypto").length).toBeGreaterThan(0);
    });
  });

  it("shows empty state when no investments", async () => {
    jest.mocked(investmentsDb.getAllInvestments).mockResolvedValue([]);
    render(<InvestmentsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no investments tracked yet/i)).toBeInTheDocument();
    });
  });
});
