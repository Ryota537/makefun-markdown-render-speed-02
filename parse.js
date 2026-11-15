// parse.js — a fast drop-in for marked 18.1.3. parse(markdown) returns exactly
// the HTML that marked.parse(markdown) returns under the default options
// (gfm on, breaks off, pedantic off, async off), for every string.
//
// The trick is boring on purpose: instead of going through the Marked class
// (which merges options, wraps errors, and checks hooks/walkTokens on every
// call — all no-ops under the defaults), this calls the same Lexer and
// Parser that marked itself uses, with the same default options object.
// A fresh tokenizer/renderer is created per call, exactly as marked.parse
// does, so no state can leak from one case to the next. The vendored marked
// source (vendor/marked/marked.esm.js, MIT, see vendor/marked/NOTICE)
// carries targeted hot-path optimizations; each one is behavior-preserving
// and is re-verified against marked on the full case set after it lands.

import { Lexer, Parser } from './vendor/marked/marked.esm.js';

// marked 18.1.3's own defaults (its `defaults` object), written out so the
// call below needs no option merging at all.
const DEFAULTS = {
  async: false,
  breaks: false,
  extensions: null,
  gfm: true,
  hooks: null,
  pedantic: false,
  renderer: null,
  silent: false,
  tokenizer: null,
  walkTokens: null,
};

/** The HTML marked 18.1.3 renders for `markdown`, with marked's defaults. */
export function parse(markdown) {
  return Parser.parse(Lexer.lex(markdown, DEFAULTS), DEFAULTS);
}
