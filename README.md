# postcss-migrate-colors-to-vars

Will:
* find all colors inside of a css file
* compare them to a Object of css vars, and their values
* replace the color with the css-var of your choosing based on the nearest delta 
    * based on [Delta E2000](https://en.wikipedia.org/wiki/Color_difference#CIEDE2000)

## Usage
```ts
import postcss from "postcss";
import migrateColorsPlugin from "@wesgro/postcss-migrate-colors-to-vars";
import fs from "node:fs";

const COLORS = {
    "--color__selection__base": "#1a1918",
    "--color__selection__base--state-1": "#393633",
    "--color__selection__base--state-2": "#44403d",
}
const input = `
h1{
    color:#1a1914; 
    background-color:#393633; 
    outline: var(--not-me-bro__other__color, #44403d);
}`;

const output = postcss(
  migrateColorsPlugin({
    ignoreRule: (node) => {
      return (
        node.type === "function" &&
        node.nodes.some((node) => node.value.startsWith("--not-me-bro"))
      );
    },

    replacementColors: COLORS,
  })
).process(input).css;
console.log(output)
// 
```