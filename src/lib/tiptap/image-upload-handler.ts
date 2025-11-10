import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

/**
 * Creates an image upload handler function using Convex mutations
 * This hook returns a function that can be passed to TipTap's ImageUploadNode
 */
export function useConvexImageUpload() {
	const generateUploadUrl = useMutation(api.shared.files.generateUploadUrl);

	return async (file: File): Promise<string> => {
		try {
			const uploadUrl = await generateUploadUrl();

			const result = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!result.ok) {
				throw new Error("Upload failed");
			}

			const { storageId } = await result.json();

			// Return the storageId - the URL will be resolved when rendering
			// For markdown, we'll store the storageId and resolve it in the viewer
			// Format: convex://storage/{storageId}
			return `convex://storage/${storageId}`;
		} catch (error) {
			console.error("Image upload error:", error);
			throw error;
		}
	};
}


