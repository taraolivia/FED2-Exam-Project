import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center pt-20">
      <div className="bg-background-lighter rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="font-heading text-4xl mb-4">404</h1>
        <h2 className="font-heading text-xl mb-4">Page Not Found</h2>
        <p className="text-text/70 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="space-y-2">
          <Link
            href="/"
            className="block bg-primary text-accent-darkest px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link href="/venues" className="block text-primary hover:underline">
            Browse Venues
          </Link>
        </div>
      </div>
    </main>
  );
}
