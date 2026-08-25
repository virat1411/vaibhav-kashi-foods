import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { handleError, jsonError, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`register:${ip}`, 8).ok) {
      return jsonError("Too many attempts. Please wait a minute.", 429);
    }
    const body = registerSchema.parse(await readJson(request));
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return jsonError("An account with this email already exists.", 409);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        passwordHash: await hashPassword(body.password),
        role: "CUSTOMER",
      },
    });
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });
    return Response.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    return handleError(error);
  }
}
