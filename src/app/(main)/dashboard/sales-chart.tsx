"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import type { ChartDataPoint } from "@/actions/dashboard/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatPrice } from "@/lib/utils";

type SalesChartProps = {
  data: ChartDataPoint[];
};

const chartConfig = {
  sales: {
    label: "Vendas",
    color: "#22c55e",
  },
  expenses: {
    label: "Despesas",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function SalesChart({ data }: SalesChartProps): React.ReactElement {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("sales");

  const total = useMemo(
    () => ({
      sales: data.reduce((acc, curr) => acc + curr.sales, 0),
      expenses: data.reduce((acc, curr) => acc + curr.expenses, 0),
    }),
    [data]
  );

  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div>
          <CardTitle>Vendas vs Despesas</CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["sales", "expenses"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                className="flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-muted data-[active=true]:border-primary data-[active=true]:bg-muted"
                data-active={activeChart === chart}
                key={chart}
                onClick={() => setActiveChart(chart)}
                type="button"
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="font-bold text-xl">
                  {formatPrice(total[key as keyof typeof total])}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return format(date, "dd/MM", { locale: ptBR });
              }}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) =>
                    format(new Date(value), "dd/MM/yyyy", {
                      locale: ptBR,
                    })
                  }
                />
              }
            />
            <Line
              activeDot={{
                r: 6,
              }}
              dataKey={activeChart}
              dot={{
                fill: chartConfig[activeChart].color,
                r: 4,
              }}
              stroke={chartConfig[activeChart].color}
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
