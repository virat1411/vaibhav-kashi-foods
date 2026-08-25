import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Invalid input.", 400);
  }
  if (error && typeof error === "object" && "status" in error) {
    const status = Number((error as { status: number }).status) || 400;
    const message = error instanceof Error ? error.message : "Request failed";
    return jsonError(message, status, "code" in error ? { code: (error as { code: string }).code } : undefined);
  }
  console.error(error);
  return jsonError("Something went wrong. Please try again.", 500);
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw Object.assign(new Error("Invalid JSON body."), { status: 400 });
  }
}
