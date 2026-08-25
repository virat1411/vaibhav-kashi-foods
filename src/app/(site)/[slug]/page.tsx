import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.legalPage.findUnique({ where: { slug } });
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-display text-4xl text-brick">{page.title}</h1>
      <p className="mt-6 whitespace-pre-wrap text-muted">{page.content}</p>
    </div>
  );
}
