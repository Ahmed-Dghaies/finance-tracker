import { DashboardPage } from "@/components/dashboard-page";
import { render, screen, waitFor } from "@/test/utils/test-utils";

describe("DashboardPage", () => {
  it("Displays financial overview cards", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("This Month Income")).toBeInTheDocument();
      expect(screen.getByText("This Month Expenses")).toBeInTheDocument();
      expect(screen.getByText("Monthly Savings")).toBeInTheDocument();
      expect(screen.getByText("Net Worth")).toBeInTheDocument();

      const totalIncome = screen.getByLabelText("total-income");
      const totalExpenses = screen.getByLabelText("total-expenses");
      const monthlySavings = screen.getByLabelText("monthly-savings");
      const netWorth = screen.getByLabelText("net-worth");

      expect(totalIncome).toHaveTextContent("€4150.00");
      expect(totalExpenses).toHaveTextContent("€70.00");
      expect(monthlySavings).toHaveTextContent("€4080.00");
      expect(netWorth).toHaveTextContent("€37780.00");
    });
  });

  it("Displays net worth goal section", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Net Worth Goal Progress")).toBeInTheDocument();
    });

    const requiredSavings = screen.getByLabelText("required-monthly-savings");
    const currentSavings = screen.getByLabelText("current-monthly-savings");

    // Required: (100000 - 38580) / (12 - currentMonth) = 5118.33 (varies by current month)
    // Current savings: 4080
    expect(requiredSavings).toHaveTextContent(/€\d+\.\d{2}/);
    expect(currentSavings).toHaveTextContent("€4080.00");

    const goalStatus = screen.getByLabelText("net-worth-goal-status");
    expect(goalStatus).toHaveTextContent("Behind");
  });

  it("Shows quick actions", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /add expense/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /add income/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /add investment/i })).toBeInTheDocument();
    });
  });
});
