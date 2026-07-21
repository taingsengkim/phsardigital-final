export default function NewsletterSection() {
  return (
    <section className="border-t py-12" style={{ backgroundColor: "#E7E3F9" }}>
      <div className="mx-auto max-w-xl px-4 text-center">
        <h2 className="text-lg font-bold">
          Sign up for Phsar Digital&apos;s News &amp; Offers
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Be the first to know about Exclusive deals,
          <br />
          New arrivals, and Marketplace insights!
        </p>
        <form
          className="mt-4 flex gap-2"
          action="#"
          method="post"
        >
          <input
            type="email"
            name="email"
            placeholder="Phsar.Digital@com.kh"
            className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            aria-label="Email address for newsletter"
          />
          <button
            type="submit"
            className="flex-shrink-0 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/80"
          >
            Sign up
          </button>
        </form>
      </div>
    </section>
  );
}
