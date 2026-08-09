import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import useIncomes from "@/hooks/use-incomes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartTooltipContent } from "../ui/chart";

interface IncomeByCategoryChartProps {
  selectedMonth: string;
}

const IncomeByCategoryChart = ({ selectedMonth }: IncomeByCategoryChartProps) => {
  const {
    state: { incomeByCategory },
  } = useIncomes({ defaultValues: { selectedMonth } });

  return (
    incomeByCategory.length > 0 && (
      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Income Breakdown</CardTitle>
          <CardDescription>Income by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeByCategory} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="category"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={54}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} width={44} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  );
};

export default IncomeByCategoryChart;
