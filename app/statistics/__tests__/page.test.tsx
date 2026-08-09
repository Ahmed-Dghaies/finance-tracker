import { render, screen, waitFor } from "@testing-library/react";

import useExpenses from "@/hooks/use-expenses";
import useIncomes from "@/hooks/use-incomes";

import StatisticsPage from "../page";

jest.mock("@/hooks/use-expenses");
jest.mock("@/hooks/use-incomes");
jest.mock("@/components/navigation", () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));
jest.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: unknown }) => <>{children}</>,
}));
jest.mock("@/components/dashboard/ExpensesChart", () => ({
  __esModule: true,
  default: () => <div data-testid="expenses-chart">Chart</div>,
}));

describe("StatisticsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useExpenses).mockReturnValue({
      state: {
        isLoading: false,
        allExpenses: [
          {
            id: "1",
            amount: 100,
            currency: "EUR",
            category: "Food",
            type: "necessary",
            date: "01/01/2024",
          },
        ],
        allExpensesCategoryRanking: [{ category: "Food", amount: 100 }],
      },
    } as any);
    jest.mocked(useIncomes).mockReturnValue({
      state: {
        isLoading: false,
        allIncome: [
          {
            id: "1",
            amount: 3000,
            currency: "EUR",
            category: "fixed",
            date: "01/01/2024",
          },
        ],
      },
    } as any);
  });

  it("shows loading state", () => {
    jest.mocked(useExpenses).mockReturnValue({
      state: { isLoading: true, allExpenses: [], allExpensesCategoryRanking: [] },
    } as any);
    jest.mocked(useIncomes).mockReturnValue({
      state: { isLoading: true, allIncome: [] },
    } as any);

    render(<StatisticsPage />);
    expect(screen.getByText(/loading statistics/i)).toBeInTheDocument();
  });

  it("displays key metrics cards", async () => {
    render(<StatisticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Best Income Month")).toBeInTheDocument();
      expect(screen.getByText("Best Savings Month")).toBeInTheDocument();
      expect(screen.getByText("Highest Expense Month")).toBeInTheDocument();
      expect(screen.getByText("Average Monthly Savings")).toBeInTheDocument();
    });
  });

  it("displays average metrics", async () => {
    render(<StatisticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Average Income")).toBeInTheDocument();
      expect(screen.getByText("Average Expenses")).toBeInTheDocument();
      expect(screen.getByText("Necessary vs Pleasure")).toBeInTheDocument();
    });
  });

  it("renders trend charts", async () => {
    render(<StatisticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Income & Expenses Trend")).toBeInTheDocument();
      expect(screen.getByText("Savings Trend")).toBeInTheDocument();
    });
  });

  it("shows empty state when no data", () => {
    jest.mocked(useExpenses).mockReturnValue({
      state: { isLoading: false, allExpenses: [], allExpensesCategoryRanking: [] },
    } as any);
    jest.mocked(useIncomes).mockReturnValue({
      state: { isLoading: false, allIncome: [] },
    } as any);

    render(<StatisticsPage />);
    expect(screen.getByText(/no data available yet/i)).toBeInTheDocument();
  });
});
