import valueParser from "postcss-value-parser";
import {
  convertToClosestColor,
  type ConvertToColorOptions,
  type ReplacementColors,
} from "./findClosestColor";
import { type Node } from "postcss-value-parser";

interface ValueParserNode {
  nodes: Node[];
}

const mathFunctions: Set<string> = new Set(["calc", "min", "max", "clamp"]);

function walk(
  parent: ValueParserNode,
  callback: (
    node: Node,
    index: number,
    parent: ValueParserNode
  ) => false | undefined
): void {
  parent.nodes.forEach((node: Node, index: number) => {
    const bubble = callback(node, index, parent);

    if (node.type === "function" && bubble !== false) {
      walk(node, callback);
    }
  });
}

function isMathFunctionNode(node: Node): boolean {
  if (node.type !== "function") {
    return false;
  }
  return mathFunctions.has(node.value.toLowerCase());
}
export type TransformOptions = {
  ignoreRule?: (node: Node, index: number, parent: ValueParserNode) => boolean;
  replacementColors: ReplacementColors;
} & ConvertToColorOptions;
function transform(value: string, options: TransformOptions): string {
  const parsed = valueParser(value);

  walk(parsed, (node: Node, index: number, parent: ValueParserNode) => {
    if (options?.ignoreRule && options.ignoreRule(node, index, parent)) {
      return false;
    } else if (node.type === "function") {
      if (/^(rgb|hsl)a?$/i.test(node.value)) {
        node.value = convertToClosestColor(
          valueParser.stringify(node),
          options
        );
      } else if (isMathFunctionNode(node)) {
        return false;
      }
    } else if (node.type === "word") {
      node.value = convertToClosestColor(node.value, options);
    }
  });

  return parsed.toString();
}

type PluginOptions = TransformOptions;
type PluginCreator = import("postcss").PluginCreator<PluginOptions>;

const plugin: PluginCreator = (config) => {
  if (!config || !config.replacementColors) {
    throw new Error("pass a config with replacementColors");
  }
  return {
    postcssPlugin: "color-migrate",

    prepare() {
      const cache = new Map<string, string>();

      return {
        OnceExit(css) {
          css.walkDecls((decl) => {
            if (
              /^(composes|font|src$|filter|-webkit-tap-highlight-color)/i.test(
                decl.prop
              )
            ) {
              return;
            }

            const value = decl.value;

            if (!value) {
              return;
            }

            const cacheKey = JSON.stringify({
              value,
              config: { maxDelta: config.maxDelta },
            });

            if (cache.has(cacheKey)) {
              decl.value = cache.get(cacheKey)!;

              return;
            }

            const newValue = transform(value, config);

            decl.value = newValue;
            cache.set(cacheKey, newValue);
          });
        },
      };
    },
  };
};

plugin.postcss = true;

export default plugin;
