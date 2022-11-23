import { type ConvertToColorOptions, type ReplacementColors } from "./findClosestColor";
import { type Node } from "postcss-value-parser";
interface ValueParserNode {
    nodes: Node[];
}
export type TransformOptions = {
    ignoreRule?: (node: Node, index: number, parent: ValueParserNode) => boolean;
    replacementColors: ReplacementColors;
} & ConvertToColorOptions;
type PluginOptions = TransformOptions;
type PluginCreator = import("postcss").PluginCreator<PluginOptions>;
declare const plugin: PluginCreator;
export default plugin;
