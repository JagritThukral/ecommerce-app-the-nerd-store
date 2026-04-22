import {
  int,
  sqliteTable,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const clothingTable = sqliteTable("clothing_table", {
  name: text().primaryKey(),
  imgSrc: text().notNull(),
  price: int().notNull(),
  gender: text().notNull(),
});

export const wishlistTable = sqliteTable(
  "wishlist",
  {
    id: int().primaryKey({ autoIncrement: true }),
    userId: text().notNull(),
    clothingName: text()
      .notNull()
      .references(() => clothingTable.name, { onDelete: "cascade" }),
    createdAt: int({ mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("wishlist_user_idx").on(table.userId),
    uniqueIndex("wishlist_user_clothing_unique").on(
      table.userId,
      table.clothingName,
    ),
  ],
);

export const orderTable = sqliteTable(
  "orders",
  {
    userId: text().notNull(),
    paypalOrderId: text().notNull(),
    paypalCaptureId: text(),
    productName: text(),
    amount: text().notNull(),
    currency: text().notNull(),
    status: text().notNull(),
    createdAt: int({ mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("order_paypal_order_unique").on(table.paypalOrderId),
    index("order_user_idx").on(table.userId),
    uniqueIndex("order_user_order_unique").on(
      table.userId,
      table.paypalOrderId,
    ),
  ],
);
