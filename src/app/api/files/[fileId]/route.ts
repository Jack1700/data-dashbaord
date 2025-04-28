import { getUploadedFile } from "@/lib/actions";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { fileId: string } },
) {
	const { fileId } = await params;

	try {
		const data = await getUploadedFile(fileId);

		if (!data) {
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to retrieve file" },
			{ status: 500 },
		);
	}
}
