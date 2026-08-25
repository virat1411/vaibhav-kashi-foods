import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddressManager } from "@/components/address-manager";

export default async function AddressesPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/addresses");
  const addresses = await prisma.address.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl text-brick">Saved addresses</h1>
      <AddressManager initial={addresses} />
    </div>
  );
}
