import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { PixelImageStudio } from "../components/organisms/PixelImageStudio";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Pixel Image</title>
        <meta
          name="description"
          content="Generate pixel-art images with URL and local upload inputs."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PixelImageStudio />
    </>
  );
};

export default Home;
