import { resetcss } from "./utils/resetcss";
import h from "./utils/tag";

export const template = (html: string) =>
  "<!DOCTYPE html>" +
  h(
    "html",
    { lang: "ja" },
    h(
      "head",
      {},
      h("meta", { charset: "UTF-8" }),
      h("meta", {
        "http-equiv": "X-UA-Compatible",
        content: "IE=edge",
      }),
      h("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
      h("title", {}, "icon.io"),
      h("style", {}, resetcss())
    ),
    h("body", {}, html)
  );
