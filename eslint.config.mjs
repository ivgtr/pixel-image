import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

export default [
  ...nextVitals,
  prettier,
  {
    rules: {
      "arrow-body-style": "off",
      "react/display-name": "off",
    },
  },
];
