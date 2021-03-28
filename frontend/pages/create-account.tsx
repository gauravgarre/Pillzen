import React from "react";
import HandleAuth from "../src/auth/user-login";
import Head from "next/head";

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Create Account - Pillzen</title>

        <meta property="og:type" content="website" />
      </Head>
      <HandleAuth authType="createAccount" />
    </>
  );
};

export default Home;
