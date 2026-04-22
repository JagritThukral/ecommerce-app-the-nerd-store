import Image from "next/image";
import ClothesCard from "@/src/components/clothes-card";

export default function Home() {
  return (
    <>
      <div className="h-screen overflow-y-scroll snap-y snap-mandatory pt-16 scroll-smooth">
        <section
          id="home"
          className="bg-linear-to-b from-primary to-primary-content w-full h-screen snap-start flex flex-col justify-center items-center overflow-hidden"
        >
          <h1 className="text-5xl font-bold max-w-1/2 p-12 text-center text-black">
            Suit up with clothing from your favourite fandom
          </h1>
          <Image
            src={"/img/spiderman-merch-1.png"}
            alt="hero image"
            width={500}
            height={500}
          />
        </section>

        <ClothesCard gender="men" label="Men's Clothing" id="men" />
        <ClothesCard gender="women" label="Women's Clothing" id="women" />
      </div>
    </>
  );
}
