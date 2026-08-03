import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>
      <CheckoutClient />
    </div>
  );
}
