import SignInFormClient from "@/modules/auth/components/sign-in-form-client";
import Image from "next/image";
import React from "react";

const Page = () => {
  return (
    <>
      <div className="w-screen h-screen justify-center flex items-center ">
        <Image
          src={"/login.svg"}
          alt="Login-Image"
          height={300}
          width={300}
          className="m-6 object-cover"
        />

        <SignInFormClient />
      </div>
    </>
  );
};

export default Page;
