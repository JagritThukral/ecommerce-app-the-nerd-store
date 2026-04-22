import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/src/db";
import { orderTable } from "@/src/db/schemas";
import { auth } from "@/src/lib/auth";
import { capturePaypalOrder } from "@/src/lib/paypal";

type RouteProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Order ID is required" },
      { status: 400 },
    );
  }

  try {
    const captured = await capturePaypalOrder(orderId);
    const purchaseUnit = captured?.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    const amount = capture?.amount?.value || purchaseUnit?.amount?.value || "0";
    const currency =
      capture?.amount?.currency_code ||
      purchaseUnit?.amount?.currency_code ||
      "USD";
    const status = capture?.status || captured?.status || "CAPTURED";
    const captureId = capture?.id || null;
    const productName = purchaseUnit?.custom_id || null;

    await db
      .insert(orderTable)
      .values({
        userId: session.user.id,
        paypalOrderId: orderId,
        paypalCaptureId: captureId,
        productName,
        amount,
        currency,
        status,
      })
      .onConflictDoUpdate({
        target: orderTable.paypalOrderId,
        set: {
          paypalCaptureId: captureId,
          productName,
          amount,
          currency,
          status,
        },
      });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        captureId,
        status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, message: "Failed to capture order", error: message },
      { status: 500 },
    );
  }
}
