"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl text-brick">Something went wrong.</h1>
      <p className="mt-3 text-muted">Please try again.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-brick px-5 py-2 text-cream">
        Try again
      </button>
    </div>
  );
}
