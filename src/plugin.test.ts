import { describe, it, expect } from 'bun:test'
import postcss from "postcss";
import plugin from "./plugin";
const COLORS = {
    "--color__selection__base": "#1a1918",
    "--color__selection__base--state-1": "#393633",
    "--color__selection__base--state-2": "#44403d",
} as const
describe('The plugin', () => {
    it('converts colors to a css var of the closest match', () => {

        const input = `h1{color:#1a1914;}`;
        const output = postcss(
            plugin({
                replacementColors: COLORS,
            })
        ).process(input).css;
        expect(output.trim()).toBe(`h1{color:var(--color__selection__base, #1a1914);}`)
    })
    it('ignores a match', () => {

        const input = `h1{color:var(--not-me-bro, #1a1911);}`;
        const output = postcss(
            plugin({
                ignoreRule: (node) => {
                    return (
                        node.type === "function" &&
                        node.nodes.some((node) => node.value.startsWith("--not-me-bro"))
                    );
                },

                replacementColors: COLORS,
            })
        ).process(input).css;
        expect(output.trim()).toBe(input)
    })
    it('ignores a higher delta', () => {

        const input = `h1{color: #fff;}`;
        const output = postcss(
            plugin({
                maxDelta: 0.1,
                replacementColors: COLORS,
            })
        ).process(input).css;
        expect(output.trim()).toBe(input)
    })
})