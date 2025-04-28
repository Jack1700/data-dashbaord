"use server"

import type { SalesData } from "@/types/sales"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// In-memory storage for uploaded files (in a real app, you'd use a database)
const uploadedFiles = new Map<string, SalesData[]>()

export async function uploadFile(data: SalesData[]): Promise<string> {
  // Generate a unique ID for the file
  const fileId = uuidv4()

  console.log("Uploading file with ID:", fileId)

  // Store the data in memory
  uploadedFiles.set(fileId, data)

  // Revalidate the path to update the UI
  revalidatePath("/")

  return fileId
}

export async function getUploadedFile(fileId: string): Promise<SalesData[] | null> {
  console.log("Fetching file with ID:", fileId)
  console.log("Uploaded files keys", uploadedFiles.keys())
  return uploadedFiles.get(fileId) || null
}
