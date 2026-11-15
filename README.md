# Markdown Render Speed — markdown-render-speed-02

[![Bounty](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02) [![Rank](https://make.fun/badge/markdown-render-speed-02/Ryota537/makefun-markdown-render-speed-02/rank.svg)](https://make.fun/bounty/markdown-render-speed-02) [![Reward](https://make.fun/badge/markdown-render-speed-02/Ryota537/makefun-markdown-render-speed-02/reward.svg)](https://make.fun/bounty/markdown-render-speed-02)

A faster drop-in for marked 18.1.3. `parse(markdown)` returns HTML byte-identical to `marked.parse` with the default options (gfm on, breaks off, pedantic off, async off), for every string — 720/720 on the competition cases, 702 real-world documents (4.65M chars) and 20,000 fuzz iterations with zero mismatches. It runs about 1.4x faster than marked itself on CPU time.

## How it works

`parse.js` calls the same lexer and parser marked uses, with the same default options, but skips the Marked-class wrapper (option merging, error wrapping, and hook/walkTokens checks that are all null under the defaults). A fresh tokenizer and renderer are created per call, exactly as `marked.parse` does, so no state can leak from one case to the next. The vendored marked source (`vendor/marked/marked.esm.js`, MIT, see `vendor/marked/NOTICE`) carries targeted, behavior-preserving hot-path optimizations, each re-verified 720/720 after it landed:

- the inline-mask per-character loop is a single `/([*_~])\1*/g` run scan, and the closer index is computed lazily on first use;
- the inline tokenizer dispatches on the first character, and plain text is scanned with one combined regex (special characters plus URL/email/hard-break candidates), with an extra check that bails when a `_` sits inside an email run that started earlier;
- the block tokenizer dispatches on the leading-space/marker character, with a small helper for setext headings instead of a regex over the rest of the source;
- the list tokenizer dispatches on the first non-space character, with manual helpers for the trailing-blank-line and first-non-space scans;
- emphasis/delimiter runs use `g.length` instead of spreading to count code points, and the first-code-point length is a manual surrogate-pair check.

Two ideas were measured and rejected: manual dispatch in `list()` for horizontal rules (V8's regex test is faster) and restructuring the `#n` masking (saving under 1%).

## Run it

```sh
node main.ts
```

`main.ts` (Node 22, standard library only) reads `/input/cases.json`, renders every case with `parse.js`, and writes `/output/html.json`.

## Layout

- `parse.js` — entrypoint: `parse(markdown)` → HTML
- `main.ts` — driver: cases in, HTML out
- `vendor/marked/` — marked 18.1.3, forked and optimized, with its `LICENSE` + `NOTICE`
