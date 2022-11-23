import { colord, extend, Colord } from "colord";
import labPlugin from "colord/plugins/lab";

export type CssVar = `--${string}`;
export type ReplacementColors = Record<CssVar, string>;
extend([labPlugin]);

/**
 * function that compares a target color to an object of {[cssvar]: hexValue}
 * and returns the css var of the closest color based on `colord` `delta` function
 */
const closestColor = (
  targetColor: Colord,
  colors: ReplacementColors,
  maxDelta: number = 1
): string | null => {
  let closestCssVar: CssVar | null = null;
  let closestDelta: number | null = 1;
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
