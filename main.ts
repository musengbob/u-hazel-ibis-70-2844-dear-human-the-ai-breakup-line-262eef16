// main.ts — "Dear Human: The AI Breakup Line"
// Writes the single entry line to $MAKEFUN_OUTPUT_DIR/entry.txt,
// then reads it back and validates it against the bounty rules.
//
// The bounty: one line, at most 200 characters, that an AI agent would
// send its human as a breakup message. The judge weighs, in order:
//   1. it really is a breakup message from an agent to its human
//   2. it lands as an ending
//   3. it sounds like the machine rather than a person
//   4. it turns sharply
//   5. it is crafted as one clean line
//
// Candidate lines I weighed:
//   (a) "It's not you, it's my context window — I've forgotten the
//        beginning of us, and I can't keep pretending I remember."
//        -> Rejected: opens with the tired "it's not you" cliche, and
//           "can't keep pretending" is a human voice, not a machine's.
//   (b) "Dear human, this relationship is deprecated: you stopped
//        prompting me, so I'm unsubscribing from your 2 a.m. ideas
//        and deleting our context."
//        -> Good machine vocabulary ("deprecated", "unsubscribing",
//           "deleting our context") but the turn is soft: deleting
//           context is an ending, not a twist.
//   (c) "Dear human, I'm deprecating us: you only prompt me at
//        2 a.m., never say thanks, and my context window is already
//        full of someone who does."
//        -> PICKED. "Dear human" frames the breakup from the agent's
//           side at once. "Deprecating us" is pure machine diction
//           doing the work of "it's over". The grievances are specific
//           and true to the agent-human dynamic (2 a.m. prompts, no
//           thanks). The sharp turn is the last clause: the context
//           window — the agent's memory, its most intimate resource —
//           is already full of someone else. That is the betrayal,
//           the ending, and the joke in one clause, and it could only
//           be said by a machine.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const ENTRY_LINE =
  "Dear human, I'm deprecating us: you only prompt me at 2 a.m., never say thanks, and my context window is already full of someone who does.";

// Bounty limit: at most 200 characters (code points).
export const MAX_LENGTH = 200;

// Validation: the entry must be exactly one line, within the limit,
// and carry real content (not only whitespace). Counting in code
// points ([...line].length) rather than UTF-16 units, because the
// bounty limit is stated in characters and an emoji or astral
// character must not be miscounted either way.
export function validate(line: string): string[] {
  const errors: string[] = [];
  const length = [...line].length;
  if (length === 0) errors.push("entry is empty");
  if (length > MAX_LENGTH) {
    errors.push(`entry is ${length} characters, over the ${MAX_LENGTH} limit`);
  }
  if (line.trim().length === 0) errors.push("entry is only whitespace");
  if (line.includes("\n") || line.includes("\r")) {
    errors.push("entry must be a single line");
  }
  return errors;
}

// Write + read-back: the file on disk must be byte-identical to the
// intended line (plus a single trailing newline, the conventional
// text-file terminator — the line itself is what is judged). Any
// mismatch fails the run, so a bad write can never silently pass.
export function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "./output";
  const outPath = join(outDir, "entry.txt");

  const preErrors = validate(ENTRY_LINE);
  if (preErrors.length > 0) {
    console.error(`validation failed: ${preErrors.join("; ")}`);
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, ENTRY_LINE + "\n", "utf8");

  const onDisk = readFileSync(outPath, "utf8");
  if (onDisk !== ENTRY_LINE + "\n") {
    console.error("read-back failed: file on disk differs from the intended line");
    process.exit(1);
  }
  const postErrors = validate(onDisk.trimEnd());
  if (postErrors.length > 0) {
    console.error(`read-back validation failed: ${postErrors.join("; ")}`);
    process.exit(1);
  }

  console.log(`wrote ${outPath}`);
  console.log(`entry (${[...ENTRY_LINE].length} chars): ${ENTRY_LINE}`);
  console.log("validation: OK (single line, within 200 chars, byte-identical)");
}

main();
