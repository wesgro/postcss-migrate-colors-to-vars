export type CssVar = `--${string}`;
export type ReplacementColors = Record<CssVar, string>;
export type ConvertToColorOptions = {
    maxDelta?: number;
    replacementColors: ReplacementColors;
};
declare function convertToClosestColor(input: string, options: ConvertToColorOptions): string;
export { convertToClosestColor };
