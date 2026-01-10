import { cn } from "@/lib/utils";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <div className=" z-20 flex flex-col items-center justify-start mt-5 px-4">
      <div className="flex flex-col justify-center items-center my-5">
        <Image src={"/hero.svg"} alt="Hero-Section" height={500} width={500} className="w-[300px] sm:w-[500px] h-auto" />

        <h1 className=" z-20 text-4xl sm:text-6xl mt-5 font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 dark:from-rose-400 dark:via-red-400 dark:to-pink-400 tracking-tight leading-[1.3] ">
          Code With with Intelligence
        </h1>
      </div>

      <p className="mt-2 text-lg text-center text-gray-600 dark:text-gray-400 px-5 max-w-2xl">
        Nimbus is an intelligent development environment engineered to enhance
        coding efficiency through advanced feature integration. It facilitates
        superior code authoring, debugging, and optimization capabilities.
      </p>
    </div>
  );
}
