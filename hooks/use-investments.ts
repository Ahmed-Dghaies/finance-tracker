import { useEffect, useState } from "react";

import {
  getAllInvestments,
  createInvestment,
  createInvestmentContribution,
  updateInvestment,
  deleteInvestment,
} from "@/lib/db/investments";
import { parseDate } from "@/lib/utils";

import type { Investment, InvestmentContribution } from "@/lib/types";

const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getRecurringTotalPerInvestment = (inv: Investment) => {
    if (!inv.recurringInvestment) {
      return 0;
    }

    const now = new Date();
    const startDate = new Date(parseDate(inv.startDate));
    const monthsSinceStart =
      now.getMonth() -
      startDate.getMonth() +
      1 +
      (now.getFullYear() - startDate.getFullYear()) * 12;

    return Math.max(0, monthsSinceStart) * inv.recurringInvestment.amount;
  };

  const getTotalInvestedPerInvestment = (inv: Investment) => {
    const contributionsTotal = (inv.contributions || []).reduce(
      (sum, contribution) => sum + contribution.amount,
      0,
    );

    return inv.initialAmount + getRecurringTotalPerInvestment(inv) + contributionsTotal;
  };

  const getAddedValuePerInvestment = (inv: Investment) => {
    const totalInvested = getTotalInvestedPerInvestment(inv);
    return inv.currentValue ? Number(inv.currentValue - totalInvested) : 0;
  };

  const investmentsValue = investments.reduce((sum, inv) => {
    const addedValue = getAddedValuePerInvestment(inv);
    return sum + addedValue;
  }, 0);

  const handleAddInvestment = async (
    investment: Omit<Investment, "id">,
    onSuccess?: () => void,
  ) => {
    try {
      await createInvestment(investment);
      await loadData();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding investment:", error);
    }
  };

  const handleUpdateInvestment = async (updatedInvestment: Investment, onSuccess?: () => void) => {
    try {
      await updateInvestment(updatedInvestment.id, updatedInvestment);
      await loadData();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating investment:", error);
    }
  };

  const handleAddInvestmentContribution = async (
    investmentId: string,
    contribution: Omit<InvestmentContribution, "id" | "investmentId">,
    onSuccess?: () => void,
  ) => {
    try {
      await createInvestmentContribution(investmentId, contribution);
      await loadData();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding investment contribution:", error);
    }
  };

  const handleDeleteInvestment = async (investmentId: string) => {
    try {
      await deleteInvestment(investmentId);
      await loadData();
    } catch (error) {
      console.error("Error deleting investment:", error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllInvestments();
      setInvestments(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    state: { investments, isLoading, investmentsValue },
    handlers: {
      getAddedValuePerInvestment,
      handleAddInvestment,
      handleUpdateInvestment,
      handleAddInvestmentContribution,
      handleDeleteInvestment,
      getTotalInvestedPerInvestment,
    },
  };
};

export default useInvestments;
