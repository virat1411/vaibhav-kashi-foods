import { z } from "zod";
import { requireUser, hashPassword, createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleError, readJson } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const { password } = z.object({ password: z.string().min(8).max(72) }).parse(await readJson(request));
    const hash = await hashPassword(password);
    const user = await prisma.user.update({
      where: { id: session.id },
      data: { passwordHash: hash, mustChangePassword: false },
    });
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: false,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
