import Image from "next/image";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import db from "@/src/db";
import { clothingTable, wishlistTable } from "@/src/db/schemas";
import { auth } from "@/src/lib/auth";

export default async function WishlistPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const items = await db
    .select({
      name: clothingTable.name,
      imgSrc: clothingTable.imgSrc,
      price: clothingTable.price,
      gender: clothingTable.gender,
      wishlistedAt: wishlistTable.createdAt,
    })
    .from(wishlistTable)
    .innerJoin(
      clothingTable,
      eq(wishlistTable.clothingName, clothingTable.name),
    )
    .where(and(eq(wishlistTable.userId, session.user.id)))
    .orderBy(desc(wishlistTable.createdAt));

  return (
    <main className="min-h-screen bg-primary-content p-6 pt-24 md:p-12 md:pt-28">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Your Wishlist</h1>
        <p className="text-black/60 mb-8">
          {items.length} {items.length === 1 ? "item" : "items"} saved.
        </p>

        {items.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-8 flex flex-col gap-4">
            <p className="text-lg">Your wishlist is empty.</p>
            <Link href="/" className="underline text-base">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <article
                key={`${item.name}-${item.wishlistedAt.valueOf()}`}
                className="rounded-2xl border border-black/10 bg-white p-4 flex flex-col"
              >
                <Image
                  src={item.imgSrc}
                  alt={item.name}
                  width={500}
                  height={500}
                  className="w-full h-auto rounded-xl"
                />
                <h2 className="text-xl font-semibold mt-4">{item.name}</h2>
                <p className="text-lg mt-1">₹{item.price}</p>
                <p className="text-sm text-black/60 capitalize mt-1">
                  {item.gender}
                </p>
                <Link
                  href={`/product/${encodeURIComponent(item.name)}`}
                  className="mt-4 inline-flex justify-center rounded-lg bg-black text-white px-4 py-2"
                >
                  View product
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
