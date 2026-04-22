import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";

import db from "@/src/db";
import { clothingTable } from "@/src/db/schemas";
import WishlistButton from "@/src/components/wishlist-button";
import PayPalCheckoutOverlay from "@/src/components/paypal-checkout-overlay";

type ProductPageProps = {
  params: Promise<{
    name: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { name } = await params;
  const productName = decodeURIComponent(name);

  const [product] = await db
    .select()
    .from(clothingTable)
    .where(eq(clothingTable.name, productName));

  if (!product) {
    return (
      <main className="min-h-screen bg-primary-content flex flex-col items-center justify-center gap-4 p-6 pt-24">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <Link href="/" className="underline text-lg">
          Back to store
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-primary-content p-6 pt-24 md:p-12 md:pt-28">
      <Link href="/" className="inline-block mb-8 underline text-lg">
        Back to store
      </Link>

      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
        <div className="rounded-2xl overflow-hidden bg-white p-4">
          <Image
            src={product.imgSrc}
            alt={product.name}
            width={900}
            height={900}
            className="w-full h-auto rounded-xl"
            priority
          />
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold leading-tight">{product.name}</h1>
          <p className="text-3xl font-semibold">₹{product.price}</p>
          <p className="text-lg text-black/70 capitalize">
            Category: {product.gender}
          </p>

          <div className="flex flex-wrap gap-3">
            <PayPalCheckoutOverlay
              productName={product.name}
              amountInr={product.price}
              clientId={process.env.PAYPAL_CLIENT_ID!}
            />
            <WishlistButton
              productName={product.name}
              showLabel={true}
              className="px-6 py-3"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
