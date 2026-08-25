import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validators";
import { handleError, jsonError, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`contact:${ip}`, 5).ok) {
      return jsonError("Too many messages. Please wait a minute.", 429);
    }
    const body = contactSchema.parse(await readJson(request));
    if (body.website) return jsonError("Rejected.", 400);
    const session = await getSession();
    await prisma.contactMessage.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        message: body.message,
        userId: session?.id,
      },
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
