"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
	dateRange: DateRange;
	onDateRangeChange: (range: DateRange) => void;
}

export function DateRangePicker({
	dateRange,
	onDateRangeChange,
}: DateRangePickerProps) {
	const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

	// Predefined date ranges
	const handlePredefinedRange = (days: number) => {
		const today = new Date();
		const from = addDays(today, -days);
		onDateRangeChange({ from, to: today });
	};

	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
					<div className="grid gap-2">
						<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
							<PopoverTrigger asChild>
								<Button
									id="date"
									variant={"outline"}
									className={cn(
										"w-full justify-start text-left font-normal sm:w-[300px]",
										!dateRange && "text-muted-foreground",
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dateRange?.from ? (
										dateRange.to ? (
											<>
												{format(dateRange.from, "LLL dd, y")} -{" "}
												{format(dateRange.to, "LLL dd, y")}
											</>
										) : (
											format(dateRange.from, "LLL dd, y")
										)
									) : (
										<span>Pick a date range</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									initialFocus
									mode="range"
									defaultMonth={dateRange?.from}
									selected={dateRange}
									onSelect={(range) => {
										onDateRangeChange(
											range || { from: undefined, to: undefined },
										);
										if (range?.to) {
											setIsPopoverOpen(false);
										}
									}}
									numberOfMonths={2}
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePredefinedRange(7)}
						>
							Last 7 days
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePredefinedRange(30)}
						>
							Last 30 days
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePredefinedRange(90)}
						>
							Last 90 days
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
