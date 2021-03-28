import React from "react";
import HandleAuth from "../src/auth/user-login";
import Head from "next/head";

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Login - Pillzen</title>

        <meta property="og:type" content="website" />
      </Head>
      <HandleAuth authType="login" />
    </>
  );
};

export default Home;
