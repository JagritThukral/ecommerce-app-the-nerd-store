import { asc, eq } from "drizzle-orm";

import db from "@/src/db";
import { clothingTable } from "@/src/db/schemas";
import Item from "@components/item";
import { Sekuya } from "next/font/google";

type ClothingItem = {
  name: string;
  imgSrc: string;
  price: number;
  gender: string;
};

type ClothesGridProps = {
  gender: string;
  label: string;
  id: string;
};
const sekuya = Sekuya({
  weight: "400",
  subsets: ["latin"],
});
export default async function ClothesGrid({
  gender,
  label,
  id,
}: ClothesGridProps) {
  let clothes: ClothingItem[] = [];

  try {
    clothes = await db
      .select()
      .from(clothingTable)
      .where(eq(clothingTable.gender, gender))
      .orderBy(asc(clothingTable.name));
  } catch {
    return <div className="text-lg text-red-600">Failed to fetch clothes.</div>;
  }

  if (clothes.length === 0) {
    return <div className="text-lg">No clothes found.</div>;
  }

  return (
    <section
      id={id}
      className="bg-primary-content w-full h-screen snap-start flex flex-col justify-center items-center overflow-hidden"
    >
      <h2 className={"text-3xl font-bold mb-4 " + sekuya.className}>{label}</h2>
      <div className="grid grid-cols-4 gap-8 mx-4">
        {clothes.map((cloth) => (
          <Item
            key={cloth.name}
            name={cloth.name}
            imgSrc={cloth.imgSrc}
            href={`/product/${encodeURIComponent(cloth.name)}`}
            price={cloth.price}
          />
        ))}
      </div>
    </section>
  );
}
