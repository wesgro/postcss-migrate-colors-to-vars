import { colord, extend, Colord } from "colord";
import labPlugin from "colord/plugins/lab";

export type CssVar = `--${string}`;
/**
 * A map of css var to hex value
 * 
 * All colors found in the source will be compared to this map, and replaced with the closest color
 * according to the `maxDelta` option
 * 
 * Currently supports the following types of colors:
 * - hex(6|8)
 * - rgb(a)
 * - hsl(a)
 */
export type ReplacementColors = Record<CssVar, string>;
extend([labPlugin]);

/**
 * function that compares a target color to an object of {[cssvar]: hexValue}
 * and returns the css var of the closest color based on `colord` `delta` function
 */
const closestColor = (
  targetColor: Colord,
  colors: ReplacementColors,
  maxDelta: ConvertToColorOptions['maxDelta'] = 1
): string | null => {
  let closestCssVar: CssVar | null = null;
  let closestDelta: number = 1;
  let cssVar: CssVar;
  for (cssVar in colors) {
    if (colors.hasOwnProperty(cssVar)) {
      const hex = colors[cssVar];
      const delta = colord(targetColor).delta(hex);

      if (
        delta <= maxDelta &&
        (closestCssVar === null || delta < closestDelta)
      ) {
        closestCssVar = cssVar;
        closestDelta = delta;
      }

      if (delta === 0) {
        // Found a perfect match, no need to continue searching
        return cssVar;
      }
    }
  }

  return closestCssVar; // Return the original color if no match exists
};
export type ConvertToColorOptions = {
  /**
  * The delta is the perceived color difference for two colors according to
  * [Delta E2000](https://en.wikipedia.org/wiki/Color_difference#CIEDE2000).
  * Returns a decimal value between 0 and 1.
  * 
  * * 1 being the most different
  * * 0 being an exact match
  * 
  * If this value is set to 1 it is assumed that **every** color found must be replaced with a new css var.
  * 
  * @default 1
  */
  maxDelta?: number;
  replacementColors: ReplacementColors;
};
function convertToClosestColor(
  input: string,
  options: ConvertToColorOptions
): string {
  const instance = colord(input);
  if (!instance.isValid()) {
    return input;
  }
  const cssVar = closestColor(
    instance,
    options.replacementColors,
    options?.maxDelta
  );
  return cssVar ? `var(${cssVar}, ${input})` : input;
}
export { convertToClosestColor };
