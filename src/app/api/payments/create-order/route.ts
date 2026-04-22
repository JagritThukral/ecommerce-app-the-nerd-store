import { NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import { createPaypalOrder } from "@/src/lib/paypal";

type CreateOrderBody = {
  amount?: string;
  currency?: string;
  productName?: string;
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = (await request
    .json()
    .catch(() => null)) as CreateOrderBody | null;
  const amount = body?.amount?.trim();
  const currency = (body?.currency || "USD").trim().toUpperCase();
  const productName = body?.productName?.trim();

  if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json(
      { success: false, message: "Valid amount is required" },
      { status: 400 },
    );
  }

  if (!productName) {
    return NextResponse.json(
      { success: false, message: "Product name is required" },
      { status: 400 },
    );
  }

  try {
    const order = await createPaypalOrder({ amount, currency, productName });

    return NextResponse.json({
      success: true,
      orderId: order.id as string,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, message: "Failed to create order", error: message },
      { status: 500 },
    );
  }
}
