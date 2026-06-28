import type { NextPage } from "next";
import Head from "next/head";
import { PixelImageStudio } from "../components/organisms/PixelImageStudio";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Pixel Image Studio</title>
        <meta name="description" content="Pixel-art image conversion studio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PixelImageStudio />
    </>
  );
};

export default Home;
