import classNames from "classnames";
import type { NextPage } from "next";
import Head from "next/head";
import React, { useCallback, useState } from "react";
import type { ImageFormOptions } from "../components/organisms/Form";
import { Form } from "../components/organisms/Form";
import { Preview } from "../components/organisms/Preview";
import { DefaultLayout } from "../layouts/DefaultLayout";

const HOST_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://pixel-image.vercel.app";

const defaultImageUrl =
  "https://pbs.twimg.com/profile_images/1354479643882004483/Btnfm47p_400x400.jpg";
const defaultSampleSize = "15";
const defaultPixelSize = "15";
const defaultPaletteSize = "8";
const Home: NextPage = () => {
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const handleImageUrl = useCallback((options: ImageFormOptions) => {
    const url = new URL(`${HOST_URL}/api`);
    url.searchParams.set("image", options.imageUrl);
    url.searchParams.set("sampleSize", options.sampleSize);
    url.searchParams.set("pixelSize", options.pixelSize);
    url.searchParams.set("k", options.paletteSize);
    url.searchParams.set("tv", options.tvEffectEnabled ? "1" : "0");
    if (options.tvEffectEnabled) {
      url.searchParams.set("tvPreset", options.tvEffectPreset);
      url.searchParams.set("tvStrength", options.tvEffectStrength);
    }
    setImageUrl(url.toString());
  }, []);

  return (
    <>
      <Head>
        <title>Pixel Image</title>
        <meta name="description" content="Generated Pixel Image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <DefaultLayout>
        <div className={classNames("mt-8")}>
          <h1 className={classNames("inline-block", "text-4xl", "font-bold", "text-white")}>
            Pixel Image
          </h1>
        </div>
        <main className={classNames("px-4")}>
          <section>
            <Preview imageUrl={imageUrl} />
          </section>
          <section className={classNames("mt-8")}>
            <Form
              handleImageUrl={handleImageUrl}
              defaultImageUrl={defaultImageUrl}
              defaultSampleSize={defaultSampleSize}
              defaultPixelSize={defaultPixelSize}
              defaultPaletteSize={defaultPaletteSize}
            />
          </section>
        </main>
      </DefaultLayout>
    </>
  );
};

export default Home;
