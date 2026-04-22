import Link from "next/link";
import Image from "next/image";
import WishlistButton from "@components/wishlist-button";
export default function Item({
  name,
  href,
  imgSrc,
  price,
}: {
  name: string;
  href: string;
  imgSrc: string;
  price: number;
}) {
  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-20">
        <WishlistButton productName={name} />
      </div>

      <Link href={href} prefetch={false}>
        <Image
          src={imgSrc}
          alt={name}
          width={400}
          height={400}
          className="rounded-xl"
        />

        <div className="text-lg font-semibold">{name}</div>
        <div className="text-lg">₹{price}</div>
      </Link>
    </div>
  );
}
