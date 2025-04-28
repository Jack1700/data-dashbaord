"use client";

import type React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { uploadFile } from "@/lib/actions";
import type { SalesData } from "@/types/sales";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FileUpload() {
	const router = useRouter();
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0] || null;
		setFile(selectedFile);
		setError(null);
		setSuccess(null);
	};

	const handleUpload = async () => {
		if (!file) {
			setError("Please select a file to upload");
			return;
		}

		// Check file type
		const fileType = file.name.split(".").pop()?.toLowerCase();
		if (fileType !== "json" && fileType !== "csv") {
			setError("Only JSON and CSV files are supported");
			return;
		}

		setIsUploading(true);
		setError(null);
		setSuccess(null);

		try {
			// Read the file content
			const fileContent = await readFileContent(file);

			// Parse the file content based on file type
			let parsedData: SalesData[];

			if (fileType === "json") {
				parsedData = parseJsonData(fileContent);
			} else {
				parsedData = parseCsvData(fileContent);
			}

			// Validate the data structure
			validateDataStructure(parsedData);

			// Upload the file
			const fileId = await uploadFile(parsedData);

			setSuccess("File uploaded successfully!");

			// Redirect to the dashboard with the file ID
			router.push(`/?fileId=${fileId}`);
		} catch (err: any) {
			setError(err.message || "An error occurred while uploading the file");
		} finally {
			setIsUploading(false);
		}
	};

	const readFileContent = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target?.result as string);
			reader.onerror = (e) => reject(new Error("Failed to read file"));
			reader.readAsText(file);
		});
	};

	const parseJsonData = (content: string): SalesData[] => {
		try {
			return JSON.parse(content);
		} catch (err) {
			throw new Error("Invalid JSON format");
		}
	};

	const parseCsvData = (content: string): SalesData[] => {
		try {
			// Split the content by lines and remove empty lines
			const lines = content.split("\n").filter((line) => line.trim() !== "");

			// Get the headers from the first line
			const headers = lines[0].split(",").map((header) => header.trim());

			// Parse the data rows
			return lines.slice(1).map((line) => {
				const values = line.split(",").map((value) => value.trim());

				// Create an object with the headers as keys and values as values
				const row: any = {};
				headers.forEach((header, index) => {
					const value = values[index];

					// Convert numeric values
					if (header === "sales_amount" || header === "items_sold") {
						row[header] = Number.parseFloat(value);
					} else if (header === "user_id") {
						row[header] = Number.parseInt(value, 10);
					} else {
						row[header] = value;
					}
				});

				return row;
			});
		} catch (err) {
			throw new Error("Invalid CSV format");
		}
	};

	const validateDataStructure = (data: any[]): void => {
		if (!Array.isArray(data) || data.length === 0) {
			throw new Error("Invalid data format: Expected a non-empty array");
		}

		// Check if the first item has the required fields
		const requiredFields = [
			"timestamp",
			"user_id",
			"region",
			"category",
			"sales_amount",
			"items_sold",
		];
		const firstItem = data[0];

		for (const field of requiredFields) {
			if (!(field in firstItem)) {
				throw new Error(
					`Invalid data format: Missing required field '${field}'`,
				);
			}
		}
	};

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Upload Sales Data</CardTitle>
				<CardDescription>
					Upload your sales data file in JSON or CSV format to analyze it in the
					dashboard.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Input
						id="file-upload"
						type="file"
						accept=".json,.csv"
						onChange={handleFileChange}
						className="cursor-pointer"
					/>
					<p className="text-sm text-muted-foreground">
						Supported formats: JSON, CSV
					</p>
				</div>

				{error && (
					<Alert variant="destructive" className="mt-4">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert className="mt-4">
						<CheckCircle2 className="h-4 w-4" />
						<AlertTitle>Success</AlertTitle>
						<AlertDescription>{success}</AlertDescription>
					</Alert>
				)}
			</CardContent>
			<CardFooter>
				<Button
					onClick={handleUpload}
					disabled={!file || isUploading}
					className="w-full sm:w-auto"
				>
					{isUploading ? (
						<>Uploading...</>
					) : (
						<>
							<Upload className="mr-2 h-4 w-4" />
							Upload File
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}
