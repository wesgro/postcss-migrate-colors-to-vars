import postcss from "postcss";
import convert from "../src/plugin";
import fs from "node:fs";
import { colors as COLORS } from "./COLORS";

let input = fs.readFileSync("./input.css");
// input = `h1{color: var(--dig-thing, #eee);background-color: #e3e3e3}`;
const output = postcss(
  convert({
    ignoreRule: (node) => {
      return (
        node.type === "function" &&
        node.nodes.some((node) => node.value.startsWith("--dig"))
      );
    },

    replacementColors: COLORS,
  })
).process(input).css;
// console.log(output);
fs.writeFileSync("./output.css", output);
