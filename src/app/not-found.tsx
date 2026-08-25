import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-5xl text-brick">Page not found</h1>
      <p className="mt-3 text-muted">That page is not on the Vaibhav Kashi Foods menu.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brick px-5 py-2 text-cream">
        Back home
      </Link>
    </div>
  );
}
