import { useEffect, useState } from "react";

import { getAllIncome, getIncomeByMonth } from "@/lib/db/income";
import { getMonthKey } from "@/lib/utils";

import type { Income } from "@/lib/types";

interface UseIncomesProps {
  defaultValues?: {
    selectedMonth?: string;
  };
}

const useIncomes = ({ defaultValues }: UseIncomesProps = {}) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [allIncome, setAllIncome] = useState<Income[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    defaultValues?.selectedMonth || getMonthKey(new Date()),
  );
  const [isLoading, setIsLoading] = useState(true);
  const totalIncome = allIncome.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const currentMonthIncomeTotal = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);

  const allIncomeByCategory = incomes.reduce(
    (acc, income) => {
      acc[income.category] = (acc[income.category] || 0) + Number(income.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  const incomeByCategory = Object.entries(allIncomeByCategory).map(([category, amount]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount,
  }));

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getIncomeByMonth(selectedMonth);
        const allDate = await getAllIncome();
        setIncomes(data);
        setAllIncome(allDate);
      } catch (error) {
        console.error("Error loading incomes data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedMonth]);

  return {
    state: {
      incomes,
      totalIncome,
      currentMonthIncomeTotal,
      isLoading,
      selectedMonth,
      incomeByCategory,
      allIncome,
    },
    handdlers: { handleMonthChange: setSelectedMonth },
  };
};

export default useIncomes;
