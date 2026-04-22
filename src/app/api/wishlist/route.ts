import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/src/db";
import { wishlistTable } from "@/src/db/schemas";
import { auth } from "@/src/lib/auth";

async function getSession(request: Request) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    const rows = await db
      .select({ clothingName: wishlistTable.clothingName })
      .from(wishlistTable)
      .where(eq(wishlistTable.userId, session.user.id));

    return NextResponse.json({
      success: true,
      data: rows.map((row) => row.clothingName),
    });
  }

  const [row] = await db
    .select({ id: wishlistTable.id })
    .from(wishlistTable)
    .where(
      and(
        eq(wishlistTable.userId, session.user.id),
        eq(wishlistTable.clothingName, name),
      ),
    )
    .limit(1);

  return NextResponse.json({
    success: true,
    wishlisted: Boolean(row),
  });
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
  } | null;
  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Product name is required" },
      { status: 400 },
    );
  }

  const [existing] = await db
    .select({ id: wishlistTable.id })
    .from(wishlistTable)
    .where(
      and(
        eq(wishlistTable.userId, session.user.id),
        eq(wishlistTable.clothingName, name),
      ),
    )
    .limit(1);

  if (existing) {
    await db.delete(wishlistTable).where(eq(wishlistTable.id, existing.id));
    return NextResponse.json({ success: true, wishlisted: false });
  }

  await db.insert(wishlistTable).values({
    userId: session.user.id,
    clothingName: name,
  });

  return NextResponse.json({ success: true, wishlisted: true });
}
