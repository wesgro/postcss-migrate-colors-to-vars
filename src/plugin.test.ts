import { describe, it, expect } from 'bun:test'
import postcss from "postcss";
import { migrateColorsToVarsPlugin as plugin } from "./plugin";
const COLORS = {
    "--color__selection__base": "#1a1918",
    "--color__selection__base--state-1": "#393633",
    "--color__selection__base--state-2": "#44403d",
} as const
describe('The plugin', () => {
    it('adds a comment', () => {

        const input = `h1{color:#1a1914;}`;
        const output = postcss(
            plugin({
                replacementColors: COLORS,
                replacedComment: (originalValue, newValue)=>`hey kids ${originalValue} ${newValue}`
            })
        ).process(input).css;
        expect(output).toContain(`/*hey kids #1a1914 var(--color__selection__base, #1a1914)*/`);
    })
    it('converts hex colors to a css var of the closest match', () => {

        const input = `h1{color:#1a1914;}`;
        const output = postcss(
            plugin({
                replacementColors: COLORS,
            })
        ).process(input).css;
        expect(output.trim()).toBe(`h1{color:var(--color__selection__base, #1a1914);}`)
    })
    it('converts rgba colors to a css var of the closest match', () => {

        const input = `h1{color:rgba(26, 25, 20, 0.5);}`;
        const output = postcss(
            plugin({
                replacementColors: COLORS,
            })
        ).process(input).css;
        expect(output.trim()).toBe(`h1{color:var(--color__selection__base, rgba(26, 25, 20, 0.5));}`)
    })
    it('converts hsla colors to a css var of the closest match', () => {

        const input = `h1{color:hsla(50, 13%, 9%, 0.8);}`;
        const output = postcss(
            plugin({
                replacementColors: COLORS,
            })
        ).process(input).css;
        expect(output.trim()).toBe(`h1{color:var(--color__selection__base, hsla(50, 13%, 9%, 0.8));}`)
    })
    it('ignores a match', () => {

        const input = `h1{color:var(--not-me-bro, #1a1911);}`;
        const output = postcss(
            plugin({
                shouldIgnoreNode: (node) => {
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