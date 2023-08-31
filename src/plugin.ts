import valueParser from "postcss-value-parser";
import {
  convertToClosestColor,
  type ConvertToColorOptions,
  type ReplacementColors,
} from "./convertToClosestColor";
import { type Node } from "postcss-value-parser";
import { type PluginCreator as PostCssPluginCreator } from "postcss";
export interface ValueParserNode {
  nodes: Node[];
}

const mathFunctions: Set<string> = new Set(["calc", "min", "max", "clamp"]);

function walk(
  parent: ValueParserNode,
  callback: (
    node: Node,
    index: number,
    parent: ValueParserNode,
  ) => false | undefined,
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
  /**
   * Will be called with the original value and the new value and be appended as a comment to the new value
   */
  replacedComment?: (originalValue: string, newValue: string) => string;
  /**
   * Will ignore any nodes that return true from this function
   */
  shouldIgnoreNode?: (
    node: Node,
    index: number,
    parent: ValueParserNode,
  ) => boolean;
  replacementColors: ReplacementColors;
} & ConvertToColorOptions;
function transform(value: string, options: TransformOptions): string {
  const parsed = valueParser(value);

  walk(parsed, (node: Node, index: number, parent: ValueParserNode) => {
    const originalValue = node.value;
    if (
      options?.shouldIgnoreNode &&
      options.shouldIgnoreNode(node, index, parent)
    ) {
      return false;
    } else if (node.type === "function") {
      if (/^(rgb|hsl)a?$/i.test(node.value)) {
        const { value: originalValue } = node;

        node.value = convertToClosestColor(
          valueParser.stringify(node),
          options,
        );
        // @ts-ignore we set the type to `word` here so it doesn't get parsed again as a function
        node.type = "word";

        const next = parent.nodes[index + 1];

        if (
          node.value !== originalValue &&
          next &&
          (next.type === "word" || next.type === "function")
        ) {
          parent.nodes.splice(index + 1, 0, {
            type: "space",
            value: " ",
            sourceIndex: 0,
            sourceEndIndex: 1,
          });
        }
      } else if (isMathFunctionNode(node)) {
        return false;
      }
    } else if (node.type === "word") {
      node.value = convertToClosestColor(node.value, options);
    }
    // no more to do nothing was changed
    if (node.value === originalValue) {
      return false;
    }

    const comment =
      options.replacedComment &&
      options.replacedComment(originalValue, node.value);
    if (comment) {
      parent.nodes.splice(index + 1, 0, {
        type: "comment",
        value: comment,
        sourceEndIndex: comment.length,
        sourceIndex: 0,
      });
    }
  });

  return parsed.toString();
}

export type PluginOptions = TransformOptions;

const migrateColorsToVarsPlugin: PostCssPluginCreator<PluginOptions> = (
  config,
) => {
  if (!config || !config.replacementColors) {
    throw new Error("pass a config with replacementColors");
  }
  return {
    postcssPlugin: "migrate-colors-to-vars",

    prepare() {
      const cache = new Map<string, string>();

      return {
        OnceExit(css) {
          css.walkDecls((decl) => {
            if (
              /^(composes|font|src$|filter|-webkit-tap-highlight-color)/i.test(
                decl.prop,
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

migrateColorsToVarsPlugin.postcss = true;

export { migrateColorsToVarsPlugin };

export { type ConvertToColorOptions, type ReplacementColors };
