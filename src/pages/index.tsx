import classNames from "classnames";
import type { NextPage } from "next";
import Head from "next/head";
import React, { useState } from "react";
import { Form } from "../components/organisms/Form";
import { Preview } from "../components/organisms/Preview";
import { DefaultLayout } from "../layouts/DefaultLayout";

const Home: NextPage = () => {
  const [imageUrl, setImageUrl] = useState(
    "https://pbs.twimg.com/profile_images/828753156523728896/ktuKrDkm_400x400.jpg"
  );

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
        <main>
          <section>
            <Preview imageUrl={imageUrl} />
          </section>
          <section>
            <Form />
          </section>
        </main>
      </DefaultLayout>
    </>
  );
};

export default Home;
