import { generateClientToken } from "@/src/lib/paypal";
import { NextResponse } from "next/server";
export async function GET(): Promise<NextResponse> {
  const clientToken = await generateClientToken();
  console.log("Generated PayPal client token:", clientToken);
  return NextResponse.json(
    {
      message: "success",
      clientToken,
    },
    { status: 200 },
  );
}
