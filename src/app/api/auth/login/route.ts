import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { handleError, jsonError, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`login:${ip}`, 10).ok) {
      return jsonError("Too many attempts. Please wait a minute.", 429);
    }
    const body = loginSchema.parse(await readJson(request));
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.isActive) return jsonError("Invalid email or password.", 401);
    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) return jsonError("Invalid email or password.", 401);

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });
    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
