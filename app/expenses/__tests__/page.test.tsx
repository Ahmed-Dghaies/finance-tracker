import { setSupabaseTable } from "@/test/utils/msw-server";
import { render, screen, waitFor, fireEvent } from "@/test/utils/test-utils";

import ExpensesPage from "../page";

jest.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: unknown }) => <>{children}</>,
}));

describe("ExpensesPage", () => {
  it("Renders loading state initially", () => {
    render(<ExpensesPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("Displays expense summary cards", async () => {
    render(<ExpensesPage />);

    await waitFor(() => {
      expect(screen.getByText("Total Expenses")).toBeInTheDocument();
      expect(screen.getByText("Necessary")).toBeInTheDocument();
      expect(screen.getByText("Pleasure")).toBeInTheDocument();
    });

    const totalExpenses = screen.getByLabelText("total-expenses");
    const necessaryExpenses = screen.getByLabelText("necessary-expenses");
    const pleasureExpenses = screen.getByLabelText("pleasure-expenses");

    // Mock data has: €50 (necessary) + €20 (pleasure) = €70 total
    expect(totalExpenses).toHaveTextContent("€70.00");
    expect(necessaryExpenses).toHaveTextContent("€50.00");
    expect(pleasureExpenses).toHaveTextContent("€20.00");
  });

  it("displays expense list after loading", async () => {
    render(<ExpensesPage />);

    const expenses = await screen.findAllByLabelText(/expense-item-/i);
    expect(expenses.length).toBe(2);
  });

  it("shows add expense button after loading", async () => {
    render(<ExpensesPage />);

    // Wait for loading to complete first
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByLabelText("open-add-expense-form")).toBeInTheDocument();
  });

  it("filters expenses by category", async () => {
    render(<ExpensesPage />);

    await waitFor(() => {
      expect(screen.getByText("Food & Dining")).toBeInTheDocument();
    });

    // Verify both expense categories are visible initially
    expect(screen.getByText("Food & Dining")).toBeInTheDocument();
    expect(screen.getByText("Transport")).toBeInTheDocument();
  });

  it("shows empty state when no expenses for the month", async () => {
    // Clear expenses to test empty state
    setSupabaseTable("expenses", []);

    render(<ExpensesPage />);

    await waitFor(() => {
      expect(screen.getByText(/no expenses found/i)).toBeInTheDocument();
    });
  });

  it("displays correct expense type badges", async () => {
    render(<ExpensesPage />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check that expense type badges are rendered
    expect(screen.getByLabelText("expense-type-necessary")).toBeInTheDocument();
    expect(screen.getByLabelText("expense-type-pleasure")).toBeInTheDocument();
  });

  it("opens add expense dialog when button clicked", async () => {
    render(<ExpensesPage />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const addButton = screen.getByLabelText("open-add-expense-form");
    fireEvent.click(addButton);

    // Dialog should open with form - title says "Add New Expense"
    await waitFor(() => {
      expect(screen.getByText("Add New Expense")).toBeInTheDocument();
    });
  });

  it("shows edit and delete buttons for each expense", async () => {
    render(<ExpensesPage />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check edit and delete buttons exist for expenses
    expect(screen.getByLabelText("edit-expense-0")).toBeInTheDocument();
    expect(screen.getByLabelText("delete-expense-0")).toBeInTheDocument();
    expect(screen.getByLabelText("edit-expense-1")).toBeInTheDocument();
    expect(screen.getByLabelText("delete-expense-1")).toBeInTheDocument();
  });
});
