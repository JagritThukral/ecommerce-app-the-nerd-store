import "dotenv/config";

import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

import db from "@/src/db";
import { clothingTable } from "@/src/db/schemas";

function sanitizeNameForFile(name: string): string {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ");
}

async function main() {
  const rl = createInterface({ input, output });

  try {
    const name = (await rl.question("Name: ")).trim();
    const priceInput = (await rl.question("Price: ")).trim();
    const filePathInput = (await rl.question("Image file path: ")).trim();
    const genderInput = (await rl.question("Gender (men / women / unisex): "))
      .trim()
      .toLowerCase();

    const validGenders = ["men", "women", "unisex"];
    const gender = validGenders.includes(genderInput) ? genderInput : "unisex";

    if (!name) {
      throw new Error("Name is required.");
    }

    const price = Number(priceInput);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("Price must be a positive number.");
    }

    if (!filePathInput) {
      throw new Error("Image file path is required.");
    }

    const sourcePath = path.resolve(filePathInput);
    const ext = path.extname(sourcePath) || ".jpg";
    const safeName = sanitizeNameForFile(name);
    if (!safeName) {
      throw new Error("Name cannot be empty after sanitization.");
    }

    const fileName = `${safeName}${ext}`;
    const publicImgDir = path.join(process.cwd(), "public", "img");
    const destinationPath = path.join(publicImgDir, fileName);
    const imgSrc = `/img/${fileName}`;

    await mkdir(publicImgDir, { recursive: true });
    await copyFile(sourcePath, destinationPath);

    await db.insert(clothingTable).values({
      name,
      imgSrc,
      price,
      gender,
    });

    console.log("Added clothing item successfully.");
    console.log(`name=${name}`);
    console.log(`price=${price}`);
    console.log(`imgSrc=${imgSrc}`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to add clothing item: ${message}`);
  process.exit(1);
});
