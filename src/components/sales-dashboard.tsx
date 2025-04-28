"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import { SalesChart } from "@/components/sales-chart";
import { SalesFilters } from "@/components/sales-filters";
import { SalesTable } from "@/components/sales-table";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SalesData } from "@/types/sales";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface SalesDashboardProps {
	initialData: SalesData[];
}

export function SalesDashboard({ initialData }: SalesDashboardProps) {
	const searchParams = useSearchParams();
	const fileId = searchParams.get("fileId");

	// State for sales data
	const [salesData, setSalesData] = useState<SalesData[]>(initialData);

	// Default date range: last month
	const today = new Date();
	const lastMonthStart = startOfMonth(subMonths(today, 1));
	const lastMonthEnd = endOfMonth(subMonths(today, 1));

	const [dateRange, setDateRange] = useState<{
		from: Date | undefined;
		to?: Date | undefined;
	}>({
		from: lastMonthStart,
		to: lastMonthEnd,
	});

	const [filters, setFilters] = useState({
		region: "",
		category: "",
		userId: "",
	});

	// Fetch uploaded data if fileId is present
	useEffect(() => {
		if (fileId) {
			fetch(`/api/files/${fileId}`)
				.then((response) => {
					if (!response.ok) {
						throw new Error("Failed to fetch uploaded file");
					}
					return response.json();
				})
				.then((data) => {
					// Parse the timestamp strings into Date objects
					const parsedData = data.map((item: any) => ({
						...item,
						timestamp: new Date(item.timestamp),
					}));
					setSalesData(parsedData);
				})
				.catch((error) => {
					console.error("Error fetching uploaded file:", error);
				});
		}
	}, [fileId]);

	// Filter data based on selected filters and date range
	const filteredData = useMemo(() => {
		return salesData.filter((item) => {
			const fromFilter = dateRange.from || lastMonthStart;
			const toFilter = dateRange.to || lastMonthEnd;
			const dateInRange =
				item.timestamp >= fromFilter && item.timestamp <= toFilter;

			const regionMatch =
				!filters.region ||
				filters.region === "all" ||
				item.region === filters.region;
			const categoryMatch =
				!filters.category ||
				filters.category === "all" ||
				item.category === filters.category;
			const userMatch =
				!filters.userId ||
				filters.userId === "all" ||
				item.user_id.toString() === filters.userId;

			return dateInRange && regionMatch && categoryMatch && userMatch;
		});
	}, [salesData, dateRange, filters, lastMonthEnd, lastMonthStart]);

	// Extract unique values for filters
	const uniqueRegions = useMemo(
		() => [...new Set(salesData.map((item) => item.region))],
		[salesData],
	);

	const uniqueCategories = useMemo(
		() => [...new Set(salesData.map((item) => item.category))],
		[salesData],
	);

	const uniqueUsers = useMemo(
		() => [...new Set(salesData.map((item) => item.user_id.toString()))],
		[salesData],
	);

	// Calculate totals for the summary cards
	const totalSales = useMemo(
		() =>
			filteredData.reduce((sum, item) => sum + item.sales_amount, 0).toFixed(2),
		[filteredData],
	);

	const totalItems = useMemo(
		() => filteredData.reduce((sum, item) => sum + item.items_sold, 0),
		[filteredData],
	);

	const totalTransactions = useMemo(() => filteredData.length, [filteredData]);

	return (
		<div className="container mx-auto space-y-6">
			<div className="flex flex-col space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
				<p className="text-muted-foreground">
					Analyze your sales data with interactive filters and visualizations.
				</p>
			</div>

			<div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
				<div className="lg:w-2/3">
					<DateRangePicker
						dateRange={dateRange}
						onDateRangeChange={setDateRange}
					/>
				</div>
				<div className="lg:w-1/3">
					<SalesFilters
						filters={filters}
						onFilterChange={setFilters}
						regions={uniqueRegions}
						categories={uniqueCategories}
						users={uniqueUsers}
					/>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Sales</CardDescription>
						<CardTitle className="text-2xl">${totalSales}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Items Sold</CardDescription>
						<CardTitle className="text-2xl">{totalItems}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Transactions</CardDescription>
						<CardTitle className="text-2xl">{totalTransactions}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Tabs defaultValue="chart">
				<TabsList>
					<TabsTrigger value="chart">Charts</TabsTrigger>
					<TabsTrigger value="table">Table</TabsTrigger>
				</TabsList>
				<TabsContent value="chart" className="space-y-4">
					<SalesChart data={filteredData} />
				</TabsContent>
				<TabsContent value="table">
					<SalesTable data={filteredData} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
