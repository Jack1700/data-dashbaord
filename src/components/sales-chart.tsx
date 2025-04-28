"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SalesData } from "@/types/sales"
import { eachDayOfInterval, endOfDay, format, isSameDay, startOfDay } from "date-fns"
import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

interface SalesChartProps {
  data: SalesData[]
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

export function SalesChart({ data }: SalesChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line")

  // Aggregate data by day for the chart
  const chartData = useMemo(() => {
    if (!data.length) return []

    // Get date range from the filtered data
    const minDate = new Date(Math.min(...data.map((item) => item.timestamp.getTime())))
    const maxDate = new Date(Math.max(...data.map((item) => item.timestamp.getTime())))

    // Create an array of all days in the range
    const days = eachDayOfInterval({
      start: startOfDay(minDate),
      end: endOfDay(maxDate),
    })

    // Aggregate data by day
    return days.map((day) => {
      const dayData = data.filter((item) => isSameDay(item.timestamp, day))

      const totalSales = dayData.reduce((sum, item) => sum + item.sales_amount, 0)
      const totalItems = dayData.reduce((sum, item) => sum + item.items_sold, 0)

      return {
        date: format(day, "yyyy-MM-dd"),
        salesAmount: Number.parseFloat(totalSales.toFixed(2)),
        itemsSold: totalItems,
        transactions: dayData.length,
      }
    })
  }, [data])

  // Aggregate data by region for the drill-down chart
  const regionData = useMemo(() => {
    const regions = [...new Set(data.map((item) => item.region))]

    return regions.map((region) => {
      const regionItems = data.filter((item) => item.region === region)
      const totalSales = regionItems.reduce((sum, item) => sum + item.sales_amount, 0)
      const totalItems = regionItems.reduce((sum, item) => sum + item.items_sold, 0)

      return {
        name: region,
        salesAmount: Number.parseFloat(totalSales.toFixed(2)),
        itemsSold: totalItems,
        transactions: regionItems.length,
      }
    })
  }, [data])

  // Aggregate data by category for the drill-down chart
  const categoryData = useMemo(() => {
    const categories = [...new Set(data.map((item) => item.category))]

    return categories.map((category) => {
      const categoryItems = data.filter((item) => item.category === category)
      const totalSales = categoryItems.reduce((sum, item) => sum + item.sales_amount, 0)
      const totalItems = categoryItems.reduce((sum, item) => sum + item.items_sold, 0)

      return {
        name: category,
        salesAmount: Number.parseFloat(totalSales.toFixed(2)),
        itemsSold: totalItems,
        transactions: categoryItems.length,
      }
    })
  }, [data])

  const renderTimeSeriesChart = () => {
    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="salesAmount"
              name="Sales Amount ($)"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line yAxisId="right" type="monotone" dataKey="itemsSold" name="Items Sold" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      )
    } else if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend />
            <Bar yAxisId="left" dataKey="salesAmount" name="Sales Amount ($)" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="itemsSold" name="Items Sold" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      )
    } else {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="salesAmount"
              name="Sales Amount ($)"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="itemsSold"
              name="Items Sold"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Over Time</CardTitle>
              <CardDescription>Sales amount and items sold over the selected period</CardDescription>
            </div>
            <div>
              <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)}>
                <TabsList>
                  <TabsTrigger value="line">Line</TabsTrigger>
                  <TabsTrigger value="bar">Bar</TabsTrigger>
                  <TabsTrigger value="area">Area</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>{renderTimeSeriesChart()}</ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Region</CardTitle>
            <CardDescription>Breakdown of sales by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData} layout="vertical" margin={{ top: 20, right: 30, left: 70, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={70} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend />
                  <Bar dataKey="salesAmount" name="Sales Amount ($)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Breakdown of sales by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 20, right: 30, left: 70, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={70} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend />
                  <Bar dataKey="salesAmount" name="Sales Amount ($)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
