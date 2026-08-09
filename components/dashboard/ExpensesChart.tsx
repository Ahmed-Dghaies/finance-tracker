"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface ExpenseCategory {
  category: string;
  amount: number;
}

interface ExpensesChartProps {
  data: ExpenseCategory[];
  title?: string;
  description?: string;
}

export default function ExpensesChart({
  data,
  title = "Top Expense Categories",
  description = "Your highest spending categories",
}: ExpensesChartProps) {
  if (data.length === 0) {
    return null;
  }

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;

    const text = String(value);

    // Approximate width of the label in pixels
    const textWidth = text.length * 7;
    const padding = 8;

    const fitsInside = width >= textWidth + padding * 2;

    return (
      <text
        x={fitsInside ? x + width - padding : x + width + padding}
        y={y + height / 2}
        fill={fitsInside ? "#fff" : "#285A64"}
        textAnchor={fitsInside ? "end" : "start"}
        dominantBaseline="middle"
        fontSize={12}
      >
        {text}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            amount: {
              label: "Amount",
              color: "var(--chart-2)",
            },
          }}
          className="h-72 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis dataKey="category" type="category" axisLine hide />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="amount" fill="var(--chart-2)" radius={[0, 4, 4, 0]} name="Amount">
                <LabelList dataKey="category" content={renderCustomizedLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
