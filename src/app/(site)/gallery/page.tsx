import { prisma } from "@/lib/db";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-display text-5xl text-brick">Gallery</h1>
      <p className="mt-3 max-w-xl text-muted">Food and room photography for Vaibhav Kashi Foods. The restaurant can replace these from the admin panel.</p>
      <div className="mt-8 columns-1 gap-4 sm:columns-2 md:columns-3">
        {images.map((image) => (
          <figure key={image.id} className="mb-4 break-inside-avoid">
            <img src={image.url} alt={image.alt} className="w-full rounded-3xl object-cover" loading="lazy" />
            <figcaption className="mt-2 text-xs text-muted">{image.alt}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
