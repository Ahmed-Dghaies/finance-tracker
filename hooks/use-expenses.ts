import { useEffect, useState } from "react";

import {
  createExpense,
  deleteExpense,
  formatDate,
  getAllExpenses,
  getExpensesByMonth,
  updateExpense,
} from "@/lib/db/expenses";
import { getMonthKey } from "@/lib/utils";

import type { Expense } from "@/lib/types";

interface UseExpensesProps {
  defaultValues?: {
    selectedMonth?: string;
  };
}

const useExpenses = ({ defaultValues }: UseExpensesProps = {}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    defaultValues?.selectedMonth || getMonthKey(new Date()),
  );
  const [isLoading, setIsLoading] = useState(true);
  const totalExpenses = allExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const currentMonthExpensesTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const getCategoryRanking = (expensesList: Expense[]) => {
    const expensesByCategory: Record<string, number> = {};
    expensesList.forEach((expense) => {
      expensesByCategory[expense.category] =
        (expensesByCategory[expense.category] || 0) + expense.amount;
    });

    return Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  };

  const copyRecurringExpenses = async () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthKey = getMonthKey(lastMonth);
    const lastMonthExpenses = await getExpensesByMonth(lastMonthKey);
    const recurringExpenses = lastMonthExpenses.filter((exp) => exp.recurring);

    const newExpenses: Omit<Expense, "id">[] = recurringExpenses.map((exp) => ({
      amount: exp.amount,
      currency: exp.currency,
      category: exp.category,
      type: exp.type,
      date: formatDate(new Date().toString()),
      notes: exp.notes,
      recurring: exp.recurring,
    }));

    await Promise.all(newExpenses.map((exp) => createExpense(exp)));

    // refresh expenses list
    const updatedExpenses = await getExpensesByMonth(selectedMonth);
    setExpenses(updatedExpenses);
  };

  const loadThisMonthExpenses = async () => {
    const data = await getExpensesByMonth(selectedMonth);
    setExpenses(data);
  };

  const handleAddExpense = async (expense: Omit<Expense, "id"> | Expense) => {
    await createExpense(expense);
    await loadThisMonthExpenses();
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    await updateExpense(updatedExpense.id, updatedExpense);
    await loadThisMonthExpenses();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId);
    await loadThisMonthExpenses();
  };

  const necessaryExpenses = expenses
    .filter((e) => e.type === "necessary")
    .reduce((sum, exp) => sum + Number(exp.amount), 0);
  const pleasureExpenses = expenses
    .filter((e) => e.type === "pleasure")
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getExpensesByMonth(selectedMonth);
        const allData = await getAllExpenses();
        setExpenses(data);
        setAllExpenses(allData);
      } catch (error) {
        console.error("Error loading expenses data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedMonth]);

  return {
    state: {
      isLoading,
      totalExpenses,
      currentMonthExpensesTotal,
      expensesCategoryRanking: getCategoryRanking(expenses),
      necessaryExpenses,
      pleasureExpenses,
      selectedMonth,
      expenses,
      allExpenses,
      allExpensesCategoryRanking: getCategoryRanking(allExpenses),
    },
    actions: {
      handleMonthChange: setSelectedMonth,
      copyRecurringExpenses,
      handleAddExpense,
      handleUpdateExpense,
      handleDeleteExpense,
    },
  };
};

export default useExpenses;
