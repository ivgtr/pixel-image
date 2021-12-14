type CSSAttributes = { [attr: string]: string };

function style(className: string, attributes: CSSAttributes, ...children: string[]): string {
  const camelToKebab = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

  const attrs = Object.entries(attributes).reduce(
    (acc, [k, v]) => `${acc} ${camelToKebab(k)}: ${v};`,
    ""
  );

  const close = `${children.join("")}`;

  return `${className} {${attrs}${close}}`;
}

export default style;
