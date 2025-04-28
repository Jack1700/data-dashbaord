"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FilterX } from "lucide-react";

interface SalesFiltersProps {
	filters: {
		region: string;
		category: string;
		userId: string;
	};
	onFilterChange: (filters: any) => void;
	regions: string[];
	categories: string[];
	users: string[];
}

export function SalesFilters({
	filters,
	onFilterChange,
	regions,
	categories,
	users,
}: SalesFiltersProps) {
	const handleFilterChange = (key: string, value: string) => {
		onFilterChange({
			...filters,
			[key]: value,
		});
	};

	const resetFilters = () => {
		onFilterChange({
			region: "",
			category: "",
			userId: "",
		});
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-medium">Filters</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 px-2 lg:px-3"
						onClick={resetFilters}
					>
						<FilterX className="h-4 w-4 mr-2" />
						Reset
					</Button>
				</div>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="space-y-2">
						<label
							htmlFor="region-filter"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Region
						</label>
						<Select
							value={filters.region}
							onValueChange={(value) => handleFilterChange("region", value)}
						>
							<SelectTrigger id="region-filter" className="w-full">
								<SelectValue placeholder="All Regions" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Regions</SelectItem>
								{regions.map((region) => (
									<SelectItem key={region} value={region}>
										{region}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="category-filter"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Category
						</label>
						<Select
							value={filters.category}
							onValueChange={(value) => handleFilterChange("category", value)}
						>
							<SelectTrigger id="category-filter" className="w-full">
								<SelectValue placeholder="All Categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="user-filter"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							User ID
						</label>
						<Select
							value={filters.userId}
							onValueChange={(value) => handleFilterChange("userId", value)}
						>
							<SelectTrigger id="user-filter" className="w-full">
								<SelectValue placeholder="All Users" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Users</SelectItem>
								{users.map((user) => (
									<SelectItem key={user} value={user}>
										{user}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
