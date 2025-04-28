import { FileUpload } from "@/components/file-upload";
import { SalesDashboard } from "@/components/sales-dashboard";
import { parseCsvData } from "@/lib/csv-parser";

async function getSalesData() {
	try {
		const response = await fetch("http://localhost:3000/data/sales_data.csv")
		if (!response.ok) {
			throw new Error(`Failed to fetch CSV: ${response.status}`);
		}

		const csvText = await response.text();

		// Parse the CSV data
		const parsedData = parseCsvData(csvText);

		// Convert timestamp strings to Date objects
		return parsedData.map(item => ({
			...item,
			timestamp: new Date(item.timestamp)
		}));
	} catch (error) {
		console.error("Error loading CSV data:", error);
		// Return empty array if there's an error
		return [];
	}
}

export default async function Page() {
	const initialData = await getSalesData()
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-6">
				<FileUpload />
				<SalesDashboard initialData={initialData} />
			</div>
		</div>
	)
}
