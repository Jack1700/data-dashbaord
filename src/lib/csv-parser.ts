import type { SalesData } from "@/types/sales";

export function parseCsvData(content: string): SalesData[] {
    try {
        // Split the content by lines and remove empty lines
        const lines = content.split('\n').filter(line => line.trim() !== '');

        // Get the headers from the first line
        const headers = lines[0].split(',').map(header => header.trim());

        // Parse the data rows
        return lines.slice(1).map(line => {
            const values = line.split(',').map(value => value.trim());

            // Create an object with the headers as keys and values as values
            const row: any = {};
            headers.forEach((header, index) => {
                const value = values[index];

                // Convert numeric values
                if (header === 'sales_amount' || header === 'items_sold') {
                    row[header] = parseFloat(value);
                } else if (header === 'user_id') {
                    row[header] = parseInt(value, 10);
                } else {
                    row[header] = value;
                }
            });

            return row;
        });
    } catch (err) {
        console.error("Error parsing CSV:", err);
        throw new Error("Invalid CSV format");
    }
}
