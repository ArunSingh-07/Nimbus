import SignInFormClient from "@/modules/auth/components/sign-in-form-client";
import Image from "next/image";
import React from "react";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nimbus",
};

import Link from "next/link";

const Page = () => {
  return (
    <>
      <div className="w-screen h-screen justify-center flex flex-col md:flex-row items-center relative gap-10">
        <div className="absolute top-4 left-4 md:top-10 md:left-10 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src={"/logo.svg"} alt="Logo" height={40} width={40} />
            <span className="font-extrabold text-lg text-white">Nimbus</span>
          </Link>
        </div>
        <Image
          src={"/login.svg"}
          alt="Login-Image"
          height={300}
          width={300}
          className="m-6 object-cover hidden md:block"
        />

        <SignInFormClient />
      </div>
    </>
  );
};

export default Page;
