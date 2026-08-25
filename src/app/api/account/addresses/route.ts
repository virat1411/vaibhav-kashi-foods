import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addressSchema } from "@/lib/validators";
import { handleError, jsonError, readJson } from "@/lib/http";

export async function GET() {
  try {
    const session = await requireUser();
    const addresses = await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return Response.json({ addresses });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = addressSchema.parse(await readJson(request));
    const address = await prisma.address.create({
      data: {
        userId: session.id,
        type: body.type ?? "HOME",
        name: body.name,
        phone: body.phone,
        line1: body.line1,
        house: body.house,
        landmark: body.landmark,
        city: body.city,
        state: body.state ?? "Uttar Pradesh",
        pincode: body.pincode,
      },
    });
    return Response.json({ address });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return jsonError("Missing address.", 400);
    await prisma.address.deleteMany({ where: { id, userId: session.id } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
