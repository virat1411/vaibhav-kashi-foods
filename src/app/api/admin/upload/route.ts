import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireRole } from "@/lib/auth";
import { handleError, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("No file uploaded.", 400);
    if (file.size > 5 * 1024 * 1024) return jsonError("File too large (max 5MB).", 400);
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) return jsonError("Unsupported image type.", 400);

    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buffer);
    return Response.json({ url: `/uploads/${name}` });
  } catch (error) {
    return handleError(error);
  }
}
