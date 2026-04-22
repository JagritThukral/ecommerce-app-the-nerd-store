import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/src/db";
import { clothingTable } from "@/src/db/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender");

    const clothes = gender
      ? await db
          .select()
          .from(clothingTable)
          .where(eq(clothingTable.gender, gender))
          .orderBy(asc(clothingTable.name))
      : await db.select().from(clothingTable).orderBy(asc(clothingTable.name));

    return NextResponse.json({
      success: true,
      data: clothes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch clothes",
        error: message,
      },
      { status: 500 },
    );
  }
}
