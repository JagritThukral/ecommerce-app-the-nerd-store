import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import db from "@/src/db";
import { orderTable } from "@/src/db/schemas";
import { auth } from "@/src/lib/auth";

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const orders = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.userId, session.user.id))
    .orderBy(desc(orderTable.createdAt));

  return (
    <main className="min-h-screen bg-primary-content p-6 pt-24 md:p-12 md:pt-28">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Past Orders</h1>
        <p className="text-black/60 mb-8">
          {orders.length} {orders.length === 1 ? "order" : "orders"} found.
        </p>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-8">
            <p className="text-lg mb-4">No orders yet.</p>
            <Link href="/" className="underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={`${order.userId}-${order.paypalOrderId}`}
                className="rounded-xl border border-black/10 bg-white p-5 flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">
                    {order.productName || "Product"}
                  </h2>
                  <span className="text-sm px-3 py-1 rounded-full border border-black/20">
                    {order.status}
                  </span>
                </div>

                <p className="text-sm text-black/60">
                  Order ID: {order.paypalOrderId}
                </p>
                <p className="text-sm text-black/60">
                  Capture ID: {order.paypalCaptureId || "-"}
                </p>
                <p className="text-lg font-medium">
                  {order.currency} {order.amount}
                </p>

                {order.productName ? (
                  <Link
                    href={`/product/${encodeURIComponent(order.productName)}`}
                    className="inline-flex w-fit px-4 py-2 rounded-lg bg-black text-white"
                  >
                    Go to product
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
