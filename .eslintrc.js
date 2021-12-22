const config = {
  env: {
    node: true,
    browser: true,
  },
  extends: ["next", "next/core-web-vitals", "prettier"],
  rules: {
    "arrow-body-style": 0,
    "react/display-name": 0,
  },
};

module.exports = config;
